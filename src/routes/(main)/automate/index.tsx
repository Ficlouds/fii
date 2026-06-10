'use client';

import { ArrowLeft, Bot, Folder, Link2, List, Send, Zap } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

import { useIsDark } from '@/hooks/useIsDark';

const N8N_BASE_URL = 'http://localhost:5679';

interface Flow {
  active?: boolean;
  id: string;
  name: string;
  updatedAt?: string;
}

interface ChatMessage {
  content: string;
  role: 'assistant' | 'user';
}

type SidebarTab = 'activity' | 'connections' | 'flows' | 'library';

const SIDEBAR_TABS: { icon: any; key: SidebarTab; label: string }[] = [
  { icon: List, key: 'flows', label: 'My Flows' },
  { icon: Zap, key: 'activity', label: 'Activity' },
  { icon: Link2, key: 'connections', label: 'Connections' },
  { icon: Folder, key: 'library', label: 'Library' },
];

const AutomatePage = memo(() => {
  const isDark = useIsDark();

  const [activeTab, setActiveTab] = useState<SidebarTab>('flows');
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [canvasUrl, setCanvasUrl] = useState(N8N_BASE_URL);

  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);

  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

  useEffect(() => {
    let cancelled = false;
    setLoadingFlows(true);
    fetch('/api/dev/automate-flows')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setFlows(data.flows || []);
      })
      .catch(() => {
        if (!cancelled) setFlows([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFlows(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openFlow = useCallback((flow: Flow) => {
    setCanvasUrl(`${N8N_BASE_URL}/workflow/${flow.id}`);
  }, []);

  const sendToAthena = useCallback(async () => {
    const prompt = chatInput.trim();
    if (!prompt || sending) return;

    setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);
    setChatInput('');
    setSending(true);

    try {
      const res = await fetch('/api/dev/automate-test', {
        body: JSON.stringify({ connectedApps: [], prompt }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      const reply = data.error
        ? `Error: ${data.error}`
        : data.message || 'Automation created.';
      setMessages((prev) => [...prev, { content: reply, role: 'assistant' }]);

      if (data.success) {
        fetch('/api/dev/automate-flows')
          .then((r) => r.json())
          .then((d) => setFlows(d.flows || []))
          .catch(() => {});
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { content: `Error: ${error.message}`, role: 'assistant' },
      ]);
    } finally {
      setSending(false);
    }
  }, [chatInput, sending]);

  return (
    <div style={{ background: bg, display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Automate sidebar */}
      <div style={{ borderRight: `0.5px solid ${border}`, display: 'flex', flexDirection: 'column', width: 240 }}>
        <div style={{ borderBottom: `0.5px solid ${border}`, padding: '16px 16px 12px' }}>
          <div style={{ color: text, fontSize: 15, fontWeight: 600 }}>Automate</div>
        </div>

        {chatMode ? (
          <>
            <div style={{ alignItems: 'center', borderBottom: `0.5px solid ${border}`, display: 'flex', gap: 8, padding: '10px 12px' }}>
              <button
                style={{ alignItems: 'center', background: 'none', border: 'none', color: textSub, cursor: 'pointer', display: 'flex', fontSize: 13, gap: 6, padding: 4 }}
                onClick={() => setChatMode(false)}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 10, overflowY: 'auto', padding: '12px' }}>
                {messages.length === 0 && (
                  <div style={{ color: textSub, fontSize: 12, lineHeight: 1.5 }}>
                    Ask Athena to build an automation, e.g. &ldquo;Send me a Slack message every morning with my calendar agenda&rdquo;.
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.role === 'user' ? text : cardBg,
                      border: msg.role === 'user' ? 'none' : `0.5px solid ${border}`,
                      borderRadius: 10,
                      color: msg.role === 'user' ? bg : text,
                      fontSize: 12,
                      lineHeight: 1.5,
                      maxWidth: '92%',
                      padding: '8px 10px',
                    }}
                  >
                    {msg.content}
                  </div>
                ))}
                {sending && (
                  <div style={{ color: textSub, fontSize: 12 }}>Athena is thinking...</div>
                )}
              </div>
              <div style={{ borderTop: `0.5px solid ${border}`, display: 'flex', gap: 6, padding: '10px' }}>
                <input
                  placeholder="Describe an automation..."
                  style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 8, color: text, flex: 1, fontSize: 12, outline: 'none', padding: '8px 10px' }}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void sendToAthena();
                  }}
                />
                <button
                  disabled={sending || !chatInput.trim()}
                  style={{ alignItems: 'center', background: text, border: 'none', borderRadius: 8, color: bg, cursor: sending ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', opacity: !chatInput.trim() || sending ? 0.5 : 1, padding: '8px 10px' }}
                  onClick={() => void sendToAthena()}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px' }}>
              {SIDEBAR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    style={{
                      alignItems: 'center',
                      background: isActive ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      color: isActive ? text : textSub,
                      cursor: 'pointer',
                      display: 'flex',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      gap: 8,
                      padding: '8px 10px',
                      textAlign: 'left',
                    }}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
              {activeTab === 'flows' && (
                <>
                  {loadingFlows ? (
                    <div style={{ color: textSub, fontSize: 12, padding: '12px 8px' }}>Loading flows...</div>
                  ) : flows.length === 0 ? (
                    <div style={{ color: textSub, fontSize: 12, padding: '12px 8px' }}>No flows yet.</div>
                  ) : (
                    flows.map((flow) => (
                      <button
                        key={flow.id}
                        style={{ background: 'transparent', border: 'none', borderRadius: 8, color: text, cursor: 'pointer', display: 'block', fontSize: 13, marginBottom: 2, overflow: 'hidden', padding: '8px 10px', textAlign: 'left', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}
                        onClick={() => openFlow(flow)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {flow.name}
                      </button>
                    ))
                  )}
                </>
              )}
              {activeTab !== 'flows' && (
                <div style={{ color: textTertiary, fontSize: 12, padding: '12px 8px' }}>Coming soon.</div>
              )}
            </div>

            <div style={{ borderTop: `0.5px solid ${border}`, padding: '12px' }}>
              <button
                style={{ alignItems: 'center', background: text, border: 'none', borderRadius: 8, color: bg, cursor: 'pointer', display: 'flex', fontSize: 13, fontWeight: 500, gap: 8, justifyContent: 'center', padding: '10px', width: '100%' }}
                onClick={() => setChatMode(true)}
              >
                <Bot size={14} /> Ask Athena
              </button>
            </div>
          </>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src={canvasUrl}
          style={{ background: cardBg, border: 'none', height: '100%', width: '100%' }}
          title="Fi Automate"
        />
      </div>
    </div>
  );
});

AutomatePage.displayName = 'AutomatePage';
export default AutomatePage;
