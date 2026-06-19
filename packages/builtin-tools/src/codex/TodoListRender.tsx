'use client';

import type { TodoWriteArgs } from '@ficlouds/builtin-tool-claude-code';
import { ClaudeCodeApiName } from '@ficlouds/builtin-tool-claude-code';
import { ClaudeCodeRenders } from '@ficlouds/builtin-tool-claude-code/client';
import type { BuiltinRenderProps } from '@ficlouds/types';
import { type ComponentType, memo } from 'react';

import { type CodexTodoListArgs, toTodoWriteArgs } from './utils';

const TodoListRender = memo<BuiltinRenderProps<CodexTodoListArgs>>(({ args, ...rest }) => {
  const TodoWriteRender = ClaudeCodeRenders[ClaudeCodeApiName.TodoWrite] as ComponentType<
    BuiltinRenderProps<TodoWriteArgs>
  >;

  return <TodoWriteRender {...rest} args={toTodoWriteArgs(args)} />;
});

TodoListRender.displayName = 'CodexTodoListRender';

export default TodoListRender;
