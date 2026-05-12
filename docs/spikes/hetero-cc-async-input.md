# Spike — `AsyncIterable<SDKUserMessage>` for `queuedMessages` (LOBE-8747)

**Status**: complete, recommendation = **GO (混合切，P2 实施)**
**Date**: 2026-05-12
**SDK version**: `@anthropic-ai/claude-agent-sdk@0.2.138`
**CC CLI**: `2.1.138`
**Scripts**: `/tmp/agent-sdk-test/{00-smoke,01-async-input,01b-respawn-compare,02-interrupt,03-error-recovery,03b-max-turns,04-priority-now-during-turn,05-priority-now-vs-next}.mjs`
**Raw logs**: `/tmp/agent-sdk-test/logs/*.log`

## TL;DR

| 维度                                | 结论                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 进程驻留                            | ✅ AsyncIterable 不关闭 → 子进程一直 alive。无 idle timeout                                                       |
| Prompt cache                        | ✅ 同进程 turn2 仅 `cache_creation=35`,respawn turn2 是 `1254`(本试验); 收益随会话长度放大                        |
| `interruptMode:'hard'`              | ✅ `q.interrupt()` + 后续 yield;orphan tool_use 自动注入合成 rejection,history 不破                               |
| `interruptMode:'soft'`              | ✅ `priority:'now'` push; 让 in-flight tool 跑完，模型的待回复被丢弃，新 prompt 进新 turn                         |
| Session JSONL                       | ✅ `persistSession` 默认 `true`,subprocess 仍写 `~/.claude/projects/<encoded-cwd>/<sid>.jsonl`                    |
| Error 恢复                          | ✅ `is_error:true` 的 result (`aborted_tools` / `max_turns`)**不会**关闭 AsyncIterator; 后续 yield 继续工作       |
| Edit-after-yield                    | ❌ 一旦 yield 进 channel SDK 即消费，无法撤回。LobeHub 侧需保持 "queue 在 store, 在 turn 结束时才 push"           |
| 跨 topic 取消                       | 纯产品决策，SDK 提供 `q.close()` 一键终止                                                                         |
| `priority` 三档对比                 | `now`= 丢弃 in-flight 回复 + tool 跑完进新 turn;`next`= 合并到同一 assistant 回复 (不要用);`later`= 两个独立 turn |
| `q.interrupt()` vs `priority:'now'` | `interrupt()` 立刻截断 tool 并注入合成 rejection;`now` 让 tool 自然跑完后才中断，但都丢弃 in-flight 回复          |
| 资源                                | RSS ≈ 312 MB / CC subprocess (基线水平，3 turns 内无明显增长)                                                     |

**建议**:**P2 实施 同进程 streaming-input 模式**, 核心映射:

| LobeHub 队列语义       | SDK 用法                | 用户视角                                                                                                                                   |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `interruptMode:'hard'` | `q.interrupt()` + yield | 模型立刻闭嘴，tool 被强制注入合成 rejection, 新 prompt 进新 turn                                                                           |
| `interruptMode:'soft'` | `priority:'now'` push   | tool 自然跑完，模型的待回复丢弃，新 prompt 进新 turn (**这就是 soft 的理想态**—— 之前 spawn 模式做不到丢弃模型回复，只能做成 `later` 模式) |

退路:

- driver 接口仍可降级回 per-turn spawn (用于 rate-limit 等异常路径)
- `priority:'next'` 在 LobeHub 现有产品语义里**没对应位置**, 不要用 (它会把两条 prompt 合并到一个 assistant 气泡)

## 实测结论 — 9 个 issue 问题

### Q1 进程驻留时间 /idle 超时

**答案**:AsyncIterable 不关闭 → CC subprocess 持续 alive,8 秒 idle 窗口无任何 timeout / 退出迹象。

**Trace** (`logs/01-async-input.log`):

```
t+8.10s   result#1 (success)
t+15.00s  == idle window check (waiting 8s with no yield) ==
t+15.05s  ps: 54342 ... /Users/arvinxx/.local/bin/claude --output-format stream-json --verbose --input-format stream-json --setting-sources= --permission-mode bypassPermissions
t+23.05s  == pushing turn 2 (priority=next) ==
t+25.68s  result#2 (success, same session_id)
```

三个 turn 的 `session_id` 完全一致:`83239567-673d-4600-b44d-0986c41c5ac5`。CLI 进程跨 turn 复用，没有重启。SDK 走的是 streaming-input 模式 (没有 `--resume` 参数，因为同一 query () 调用);CLI 启动后只 `--output-format stream-json --input-format stream-json`, 内部 control protocol 喂消息。

**含义**:`enqueueMessage` 不再需要等 turn 结束才 spawn, 只需 `channel.push(SDKUserMessage)`。

### Q2 Prompt cache 命中率 (同进程 vs respawn+resume)

**测试条件**: 同样 3 turn, 每 turn 只是简短 echo。

| Turn | 同进程 cache_read /cache_create | respawn+resume cache_read / cache_create |
| ---- | ------------------------------- | ---------------------------------------- |
| 1    | 14651 / **3015**                | 14651 / 1896                             |
| 2    | 17666 / **35**                  | 16547 / **1254**                         |
| 3    | 17701 / 35                      | 17801 / 35                               |

**Trace**: `logs/01-async-input.log` / `logs/01b-respawn-compare.log`

**含义**:

- 第一个 turn 同进程多写了～1119 tokens (SDK 内部 setup 多塞了一些 cache marker)
- 第二个 turn 同进程**少写～1219 tokens**(respawn 必须重新 mint cache 段)
- 净收益约 100-200 tokens /turn 在合成 workload。**真实长会话**(tool-heavy / 长 context) 收益按比例放大
- 收益的另一面：同进程 turn1 自带的 cache_creation 是固定 cost,respawn 模式则均摊到每个 turn

不是 "翻天覆地的差距", 但**至少不亏**; 真实工具调用场景应在 1K-10K tokens /turn 量级。

### Q3 `interruptMode:'hard'` 映射 — `q.interrupt()` + yield

**答案**: 可以用 `q.interrupt()` 立刻终止，然后 push 新消息 (无需 priority='now')。SDK 自动给 in-flight tool_use 注入合成 rejection,history 保持 well-formed。

**Trace** (`logs/02-interrupt.log`):

```
t+8.33s  tool_use Bash {"command":"sleep 4 && echo step1", ...}
t+8.44s  == detected mid-tool; calling query.interrupt() ==
t+8.45s  interrupt() resolved
t+8.95s  == pushing follow-up message after interrupt ==
t+9.04s  tool_result toolu_01 "The user doesn't want to proceed with this tool use. The tool use was rejected..."
t+9.04s  result {sid, subtype: "error_during_execution", is_error: true, terminal_reason: "aborted_tools"}
t+9.04s  init  ← 新 turn 在同 session 内启动
t+10.90s assistant.text post-interrupt
t+10.98s result {sid, subtype: "success", terminal_reason: "completed"}
```

**含义**:

- `q.interrupt()` 是 ✅ 推荐路径 (对应当前 `interruptMode:'hard'`)
- AsyncIterator 不会因为 `is_error:true` 关闭，后续 yield 直接工作
- LobeHub 不再需要 spawn 新进程 + `--resume`

### Q4 `interruptMode:'soft'` 映射 — `priority:'now'`

**答案**: 用 `priority:'now'` push, 让 in-flight tool 自然跑完，但**丢弃模型对第一条 prompt 的回复**, 新 prompt 进新 turn 单独处理。

**Trace** (`logs/05-now.log`):

```
t+8.70s   tool_use Bash sleep 8 && echo first-tool-done
t+10.85s  PUSH (priority=now)
t+17.39s  tool_result first-tool-done          ← tool 自然跑完,没被截断
t+17.39s  result terminal:aborted_tools text="" ← 第一条 prompt 的 assistant 回复被丢弃
t+17.39s  init                                  ← 同 session 新 turn
t+19.75s  assistant: "SECOND-PROMPT-DONE"
```

**为什么不是 `priority:'later'`**:`later` 会让模型把第一条 prompt 的回复**完整吐出来**才处理第二条，但 LobeHub 用户在 QueueTray 里加新消息的意图**就是想 pivot**—— 之前的回复对用户已无意义。spawn 模式因为无法控制 "模型生成中途丢弃" 只能做成 `later`,SDK 模式应该升级到 `now`。

**为什么不是 `priority:'next'`**:`next` 把两条 prompt 合并到**同一个 assistant 气泡**回复 (实测:`"FIRST-PROMPT-DONE\n\nSECOND-PROMPT-DONE"`), 这对 UI 是反直觉的 —— 用户期望两条独立 message。

**为什么不是 `q.interrupt()`**:`interrupt()` 会立刻给 tool 注入合成 rejection, 语义比 soft 重 ——soft 的契约是 "不打断我手头的工具，但请改变思路"。

**含义**:LobeHub `enqueueMessage(softMode)` 时:

- 旧 spawn 路径：写 store, 等当前 op 结束 → `drainQueuedMessages` → `sendMessage` 起新进程
- 新 SDK 路径：直接 `channel.push({...msg, priority: 'now'})`,SDK 内部完成 "等 tool + 丢回复 + 起新 turn"

### Q5 Session JSONL 持久化

**答案**:✅ `persistSession` 默认 `true`,subprocess 写 `~/.claude/projects/-private-tmp-agent-sdk-test-scratch/<sid>.jsonl`(macOS `/tmp` 解析为 `/private/tmp`,encoded cwd 用真实路径)。

**Trace**:

```bash
$ wc -l ~/.claude/projects/-private-tmp-agent-sdk-test-scratch/83239567-...jsonl
18 lines # 3 turns × (user + assistant + result + queue markers) ≈ 18
```

JSONL 头部样本:

```jsonl
{"type":"queue-operation","operation":"enqueue", ...}
{"type":"queue-operation","operation":"dequeue", ...}
{"type":"user","message":{"role":"user","content":"Reply with..."}, ...}
```

**含义**:

- **不需要** 切到 `sessionStore` adapter (那是高级特性，用于 ZDR/HIPAA 等场景的二次写入)
- LobeHub 现有 `agentSessionId` + `--resume` 路径**继续兼容**—— 下次 spawn 时仍可 `--resume <sid>` 接上
- 注意 macOS 的 `/private/tmp` vs `/tmp` 差异:cwd 持久化时要存 `realpath` 后的路径，否则 resume 找不到 JSONL

### Q6 Rate limit /model error 后能否继续 yield

**答案**:✅ 在两种已测试 error 路径下，AsyncIterator 都不关闭；后续 yield 继续工作。

**测试覆盖**:

1. `aborted_tools` (`is_error:true`) — Spike 2,interrupt 中断 → result.is_error=true → 后续 yield 成功消费
2. `max_turns` (`is_error:true`) — `logs/03b-max-turns.log`, 跑出 `error_max_turns` 后，recovery yield 立刻被新 turn 消费

```
t+8.79s  result {"subtype":"error_max_turns","is_error":true,"terminal_reason":"max_turns","num_turns":2}
t+12.00s == pushing recovery message ==
t+12.01s init  ← 新 turn 启动
t+14.45s result {"subtype":"success",...}
```

**未实测**:`prompt_too_long` / `model_error` / 真实 rate-limit (`blocking_limit`)—— 但 SDK 类型签名 (`TerminalReason`) 和这两条已测的语义一致，**强假设**它们也不关闭 iterator。**P2 实施时建议加 e2e 测试**显式覆盖 rate-limit 路径 (可在网关侧 mock 429)。

### Q7 用户编辑队列里已 yield 出去的消息

**答案**:❌ 不行。一旦 `channel.push(msg)` 进入 SDK, 无 API 可撤回或修改。

**含义**:LobeHub 现有的 "queue 在 zustand store,turn 结束时再 drain push" 模型**必须保留**。具体策略:

- `enqueueMessage` 仍然只写 store, 不调 SDK
- `interruptMode:'soft'` 在当前 turn 结束的回调里 drain → push
- `interruptMode:'hard'` 调 `q.interrupt()` → drain → push
- QueueTray 的编辑 / 删除作用于 store, 不涉及 SDK

唯一区别于现状:**不再需要 spawn 新进程**, 而是 push 到已有 channel。

### Q8 跨 topic 切换时进程要不要 cancel

**答案**: 纯 LobeHub 产品决策，SDK 本身不感知 topic。可选路径:

- (a) **不 cancel**: 留 query 继续跑；result 写 DB,topic 切回时显示已完成；此为现在的 Plan A 行为
- (b) **cancel**: 调 `q.close()`(立刻终止 subprocess) 或 `q.interrupt()`(优雅，保留 session)

`q.close()` 比当前 SIGINT spawn 更干净：不会留 zombie process。
`session_id` 仍在 jsonl 里，下次回到 topic 时可 `--resume`。

**推荐**: 保持 (a), 因为后台跑的 CC 任务对用户有价值 (LOBE-8742 已有相关讨论)。

### Q9 mid-tool interrupt 后，模型看到的 tool_use 状态

**答案**:✅ 干净。`q.interrupt()` 给 orphan `tool_use` 注入合成 `tool_result`:`"The user doesn't want to proceed with this tool use. The tool use was rejected..."`, 然后下一个 user message 进入 history。

**Trace** (`logs/02-interrupt.log`):

```
tool_use Bash {"command":"sleep 4 && echo step1"}
tool_result toolu_01 "The user doesn't want to proceed with this tool use. The tool use was rejected..."
```

新 turn 的 user message 进 history 时，前置的 (tool_use, synthetic_tool_result) 对齐合法。后续 turn 模型行为正常 (实测响应 "post-interrupt")。

**注意 — 两者的语义层级**:

- `q.interrupt()` = **强制立刻终止 tool** + 注入合成 rejection。对应 `interruptMode:'hard'`("我现在就要停，工具我不在乎")
- `priority:'now'` = **让 tool 自然跑完**, 但**丢弃模型对第一条 prompt 的回复**。对应 `interruptMode:'soft'`("不打断工具，但请改思路")

两者**都丢弃 in-flight 回复**, 区别在**是否截断 tool**。P2 实施按此分工映射。

### Q10 内存 / CPU (同进程长 running)

**答案**:RSS ≈ **312 MB** / CC subprocess (基线水平),3 turn 内无明显增长。

**Trace** (`logs/01-async-input.log`,t+15s ps snapshot):

```
54342 54340  00:15 319696  /Users/arvinxx/.local/bin/claude --output-format stream-json ...
```

`319696` KB ≈ 312 MB。这是 CC CLI 启动后的稳态。**未做长时压测**(只跑了 3 个简短 turn), 建议 P2 在 internal dogfood 阶段监测一周以确认无泄漏。

## 与当前 `executeHeterogeneousAgent` 的映射

当前流程 (`src/store/chat/slices/aiChat/actions/heterogeneousAgentExecutor.ts:1779-1827`):

```
sendPrompt(agentSessionId, message, ...)
  → main process spawn CC with --resume
  → await result
  → drainQueuedMessages → mergeQueuedMessages
  → setTimeout(100, sendMessage)  ← 起新进程
```

切换后:

```
首次 sendPrompt → main 启动 query() + channel
  enqueueMessage(softMode) → channel.push({...msg, priority:'now'})
    // tool 跑完 + 丢弃模型回复 + 新 turn 处理新 prompt
  enqueueMessage(hardMode) → q.interrupt() → channel.push(msg)
    // tool 立刻被合成 rejection 截断 + 新 turn 处理新 prompt
后续 sendPrompt → 复用 channel,push 即可
关闭 topic / 完成 → channel.close()
```

⚠️ **Soft mode 行为变化**(用户可感知): 旧 spawn 模式下 soft interrupt 后，第一条 prompt 的回复会被**完整生成出来**才处理下一条 (`later` 语义); 新 SDK 模式下，第一条的待回复被**丢弃**(`now` 语义), 用户直接看到模型回应新 prompt。这是**理想行为**—— 之前是 spawn 模式技术上做不到才退而求其次。Release note 里需要明示。

**关键改造点**:

1. `HeterogeneousAgentCtr.runSdkStream` 把 `channel` / `q` 作为 session 级状态保留，而不是 per-`sendPrompt` 新建
2. driver 接口加 `pushUserMessage(msg)` + `interrupt()`(实际上 `interrupt` 已经有了)
3. `heterogeneousAgentExecutor` 末尾的 drain → setTimeout (100, sendMessage) → 改成 drain → ipc call `pushUserMessage`
4. session 的 "完成" 判定要重设：不再是 result 事件 = 进程退出，而是 result 事件 = 一个 turn 结束；真正的 session 关闭由 topic close / 用户切走触发

## P2 实施风险点

| 风险                                                       | 影响                | 缓解                                                                                                                     |
| ---------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `prompt_too_long` / 真实 rate-limit 未实测                 | 罕见但用户可见      | P2 加 e2e 覆盖 (mock 429);driver 接口保留 fallback 到 respawn                                                            |
| 跨 topic 切换的 session lifetime 不清晰                    | 内存累积            | P2 加 idle timer (N 分钟无 yield 自动 close) + topic close hook                                                          |
| `priority` 三档容易写错 (`'now'` vs `'next'` vs `'later'`) | 实施陷阱            | 单测覆盖三档语义；`interruptMode:'soft'` 必走 `'now'`,`hard` 必走 `interrupt()`; 禁用 `'next'`(会合并气泡)               |
| Soft interrupt 行为变化 (`later` → `now`) 用户可感知       | 习惯切换            | Release note 明示；dogfood 期收集反馈                                                                                    |
| Main process 维护 channel,renderer 跨 IPC push             | 需重设 IPC 边界     | `HeterogeneousAgentCtr` 内部 `Map<agentSessionId, channel>`,renderer 通过 sessionId 推消息；现有 `sendPrompt` IPC 改语义 |
| `/private/tmp` vs `/tmp` cwd 差异                          | resume 找不到 jsonl | `workingDirectory` 持久化时 `realpath`; 现有代码已注意，需复查                                                           |
| Long-running RSS 监控                                      | 内存泄漏潜在        | 内部 dogfood 加 ps watcher;14 天观察期                                                                                   |

**工作量估算**:**P2 = 4-6 工作日**

- 1 day: driver 接口 + `HeterogeneousAgentCtr` 改造 (channel 复用)
- 1 day: `heterogeneousAgentExecutor` drain 路径重写
- 1 day: IPC 协议改 + renderer 状态机调整
- 1 day: e2e + rate-limit fallback
- 1-2 day: edge case /dogfood/ 修 bug

## Go/No-Go 决策

**GO**(混合切):

- ✅ Q1/Q2/Q3/Q4/Q5/Q9 全部满足切换条件
- ✅ 主要收益：取消 spawn 开销 + cache_creation 节省 (turn 2+ 明显)
- ✅ 主要风险 (Q6 rate-limit) 可控，fallback 路径存在
- ⚠️ 必须明确 `interruptMode:'hard'` 走 `q.interrupt()`, 不只是 `priority:'now'`
- ⚠️ Q7 (edit-after-yield 不行)= store-side queue 必须保留，这是 by-design 而非缺陷

**实施建议**: 挂回 LOBE-8742 P2 列表，优先级 P1-P2 (取决于 cache 成本压力)。

## 附录 — 关键 SDK API 引用

```ts
// sdk.d.ts:2067-2281
export declare interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
  streamInput(stream: AsyncIterable<SDKUserMessage>): Promise<void>;
  close(): void;
  // ...
}

// sdk.d.ts:3661
export declare type SDKUserMessage = {
  type: 'user';
  message: MessageParam;
  parent_tool_use_id: string | null;
  priority?: 'now' | 'next' | 'later';
  shouldQuery?: boolean;
  // ...
};

// sdk.d.ts:1344-1350
persistSession?: boolean;  // default true → writes ~/.claude/projects/<cwd>/<sid>.jsonl
```
