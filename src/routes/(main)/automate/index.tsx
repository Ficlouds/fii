import { createStaticStyles } from 'antd-style';
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Home,
  Library,
  Plug,
  Plus,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { memo, type MouseEvent, useEffect, useRef, useState } from 'react';

import {
  COLLAPSED_WIDTH as SIDEBAR_COLLAPSED_WIDTH,
  EXPANDED_WIDTH as SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_BG,
} from '@/features/NavPanel/components/NavPanelDraggable';
import { useIsDark } from '@/hooks/useIsDark';
import { useGlobalStore } from '@/store/global';

const N8N_BASE_URL = 'http://localhost:5679';
const N8N_PROJECT_URL = `${N8N_BASE_URL}/projects/IWCl1gRTE8Zji5i7/workflows`;
const NEW_FLOW_URL = `${N8N_BASE_URL}/workflow/new`;
const EXECUTIONS_URL = `${N8N_BASE_URL}/home/executions`;
const SETTINGS_URL = `${N8N_BASE_URL}/settings/personal`;
const TEMPLATES_URL = `${N8N_BASE_URL}/templates`;
const CONNECT_URL = '/connect';

const LAUNCH_MIN_WIDTH = Math.round(SIDEBAR_EXPANDED_WIDTH * 1.15);
const LAUNCH_MAX_WIDTH = 480;

// Header height matches the vertical offset of the first icon in Fi's
// collapsed sidebar (12px top padding + 4px logo margin + 20px logo + 12px margin)
const HEADER_HEIGHT = 48;

const SESSION_KEY = 'fi-automate-session';
const RECENTS_KEY = 'fi-automate-recents';
const SESSION_TTL_MS = 180_000;
const RECENTS_VISIBLE = 5;
const RECENTS_MAX = 50;

const SUGGESTIONS = [
  'Send me a Gmail every morning at 8am',
  'Notify me on Slack when I get an email from my boss',
  'Schedule a weekly summary every Friday evening',
  'Monitor my inbox and alert me on Telegram',
  'Post my calendar events to Slack every morning',
  'Send me a Telegram message with my daily tasks',
  'Weekly report every Sunday night to my email',
  'Alert me when I get a message from a VIP contact',
  'Create a flow that backs up my Drive files weekly',
  'Remind me on WhatsApp every day at 7am',
];

interface ChatMessage {
  content: string;
  role: 'assistant' | 'user';
}

interface AutomateSession {
  flowId: string;
  flowName: string;
  lastActivity: number;
  messages: ChatMessage[];
}

interface RecentConversation {
  flowId: string;
  flowName: string;
  id: string;
  lastMessage: string;
  messages: ChatMessage[];
  timestamp: number;
}

const loadSession = (): AutomateSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSession = (session: AutomateSession): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore quota / serialization errors
  }
};

const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
};

const loadRecents = (): RecentConversation[] => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecents = (recents: RecentConversation[]): void => {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, RECENTS_MAX)));
  } catch {
    // ignore quota / serialization errors
  }
};

const timeAgo = (timestamp: number): string => {
  const diff = Math.max(0, Date.now() - timestamp);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
};

const styles = createStaticStyles(({ css, cssVar }) => ({
  scrollTrack: css`
    animation: automate-scroll-suggestions 20s linear infinite;

    @keyframes automate-scroll-suggestions {
      0% {
        transform: translateY(0);
      }

      100% {
        transform: translateY(-50%);
      }
    }
  `,
  suggestionRow: css`
    color: ${cssVar.colorTextPlaceholder};
    cursor: pointer;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    padding: 3px 0;
    text-align: center;
    transition: color 0.15s ease;

    &:hover {
      color: ${cssVar.colorText};
    }
  `,
}));

interface SidebarItemProps {
  active?: boolean;
  collapsed?: boolean;
  icon: any;
  isDark: boolean;
  label: string;
  onClick?: () => void;
}

const SidebarItem = memo<SidebarItemProps>(({ icon: Icon, label, isDark, active, collapsed, onClick }) => {
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  return (
    <div
      title={collapsed ? label : undefined}
      style={{
        alignItems: 'center',
        background: active ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        gap: collapsed ? 0 : 8,
        height: 36,
        justifyContent: collapsed ? 'center' : 'flex-start',
        paddingInline: collapsed ? 0 : 10,
      }}
      onClick={onClick}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, height: 28, justifyContent: 'center', width: 28 }}>
        <Icon color={active ? text : textSub} size={18} />
      </div>
      {!collapsed && (
        <span style={{ color: active ? text : textSub, fontSize: 13, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

interface RecentItemProps {
  isDark: boolean;
  onClick: () => void;
  recent: RecentConversation;
}

const RecentItem = memo<RecentItemProps>(({ recent, isDark, onClick }) => {
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const isLive = Date.now() - recent.timestamp < SESSION_TTL_MS;

  return (
    <div
      style={{ borderRadius: 8, cursor: 'pointer', padding: '6px 14px' }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
        <span
          style={{
            background: isLive ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'),
            borderRadius: '50%',
            flexShrink: 0,
            height: 6,
            width: 6,
          }}
        />
        <span style={{ color: text, flex: 1, fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recent.flowName || 'Untitled automation'}
        </span>
        <span style={{ color: textTertiary, flexShrink: 0, fontSize: 11 }}>{timeAgo(recent.timestamp)}</span>
      </div>
      {recent.lastMessage && (
        <div style={{ color: textSub, fontSize: 11, fontWeight: 400, marginLeft: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recent.lastMessage}
        </div>
      )}
    </div>
  );
});

RecentItem.displayName = 'RecentItem';

interface IframeModalProps {
  onClose: () => void;
  src: string;
  title: string;
}

const IframeModal = memo<IframeModalProps>(({ src, onClose, title }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          height: '85vh',
          maxWidth: 1100,
          overflow: 'hidden',
          position: 'relative',
          width: '80vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            alignItems: 'center',
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            height: 32,
            justifyContent: 'center',
            position: 'absolute',
            right: 12,
            top: 12,
            width: 32,
            zIndex: 1,
          }}
          onClick={onClose}
        >
          <X color="#111" size={16} />
        </button>
        <iframe src={src} style={{ border: 'none', height: '100%', width: '100%' }} title={title} />
      </div>
    </div>
  );
});

IframeModal.displayName = 'IframeModal';

interface ChatBarProps {
  isDark: boolean;
  loading: boolean;
  minHeight?: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  value: string;
}

const ChatBar = memo<ChatBarProps>(({ isDark, loading, onSend, onChange, value, multiline, minHeight }) => {
  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    onChange('');
  };

  const fieldStyle = {
    background: 'transparent',
    border: 'none',
    color: isDark ? '#ececec' : '#111',
    flex: 1,
    fontFamily: '-apple-system, sans-serif',
    fontSize: 13,
    outline: 'none',
  } as const;

  return (
    <div style={{ minHeight, padding: '10px 10px 14px' }}>
      <div
        style={{
          alignItems: 'flex-end',
          background: isDark ? '#1a1a1a' : '#f5f5f5',
          border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 12,
          display: 'flex',
          gap: 8,
          height: minHeight ? '100%' : undefined,
          padding: '10px 12px 14px',
        }}
      >
        {multiline ? (
          <textarea
            disabled={loading}
            placeholder="What would you like to automate?"
            rows={3}
            style={{ ...fieldStyle, paddingTop: 10, resize: 'none', verticalAlign: 'top' }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        ) : (
          <input
            disabled={loading}
            placeholder="What would you like to automate?"
            style={fieldStyle}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        )}
        <button
          disabled={loading || !value.trim()}
          style={{
            alignItems: 'center',
            alignSelf: 'flex-end',
            background: '#000',
            border: 'none',
            borderRadius: 8,
            cursor: value.trim() && !loading ? 'pointer' : 'default',
            display: 'flex',
            flexShrink: 0,
            height: 32,
            justifyContent: 'center',
            opacity: value.trim() && !loading ? 1 : 0.3,
            transition: 'opacity 0.15s',
            width: 32,
          }}
          onClick={handleSend}
        >
          <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
            <path d="M6 10V2M2 6l4-4 4 4" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
});

ChatBar.displayName = 'ChatBar';

const AutomatePage = memo(() => {
  const isDark = useIsDark();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState(N8N_PROJECT_URL);

  const [launchOpen, setLaunchOpen] = useState(false);
  const [launchWidth, setLaunchWidth] = useState(LAUNCH_MIN_WIDTH);
  const [resizing, setResizing] = useState(false);
  const launchPanelRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flowId, setFlowId] = useState('');
  const [flowName, setFlowName] = useState('');
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');

  const [recents, setRecents] = useState<RecentConversation[]>([]);
  const [recentsExpanded, setRecentsExpanded] = useState(false);

  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  // Collapse Fi's main sidebar to icons-only while on this page; restore on unmount
  useEffect(() => {
    const previous = useGlobalStore.getState().status.showLeftPanel;
    useGlobalStore.getState().toggleLeftPanel(false);
    return () => {
      useGlobalStore.getState().toggleLeftPanel(previous);
    };
  }, []);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const onResizeStart = (e: MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = launchWidth;
    setResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const onMove = (moveEvent: globalThis.MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = moveEvent.clientX - startXRef.current;
      const next = Math.min(LAUNCH_MAX_WIDTH, Math.max(LAUNCH_MIN_WIDTH, startWidthRef.current + delta));
      setLaunchWidth(next);
    };

    const onUp = () => {
      isResizingRef.current = false;
      setResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const pushToRecents = (msgs: ChatMessage[], fId: string, fName: string) => {
    if (msgs.length === 0) return;
    const recent: RecentConversation = {
      flowId: fId,
      flowName: fName || 'Untitled automation',
      id: fId || `local-${Date.now()}`,
      lastMessage: msgs.at(-1)?.content ?? '',
      messages: msgs,
      timestamp: Date.now(),
    };
    const updated = [recent, ...recents.filter((r) => r.id !== recent.id)].slice(0, RECENTS_MAX);
    setRecents(updated);
    saveRecents(updated);
  };

  const openLaunchPanel = () => {
    const session = loadSession();
    if (session && Date.now() - session.lastActivity < SESSION_TTL_MS) {
      setMessages(session.messages);
      setFlowId(session.flowId);
      setFlowName(session.flowName);
    } else {
      setMessages([]);
      setFlowId('');
      setFlowName('');
    }
    setLaunchOpen(true);
  };

  const closeLaunchPanel = () => {
    if (messages.length > 0) {
      saveSession({ flowId, flowName, lastActivity: Date.now(), messages });
      pushToRecents(messages, flowId, flowName);
    }
    setLaunchOpen(false);
  };

  const handleNewConversation = () => {
    pushToRecents(messages, flowId, flowName);
    clearSession();
    setMessages([]);
    setFlowId('');
    setFlowName('');
    setDraft('');
  };

  const openRecent = (recent: RecentConversation) => {
    setMessages(recent.messages);
    setFlowId(recent.flowId);
    setFlowName(recent.flowName);
    if (recent.flowId) setCanvasUrl(`${N8N_BASE_URL}/workflow/${recent.flowId}`);
    setLaunchOpen(true);
  };

  const handleSend = async (prompt: string) => {
    const nextMessages: ChatMessage[] = [...messages, { content: prompt, role: 'user' }];
    setMessages(nextMessages);
    setSending(true);

    let nextFlowId = flowId;
    let nextFlowName = flowName;
    let assistantMessage: ChatMessage;

    try {
      const res = await fetch('/api/dev/automate-test', {
        body: JSON.stringify({ connectedApps: [], prompt }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        nextFlowId = data.workflowId;
        nextFlowName = data.workflowName;
        setFlowId(nextFlowId);
        setFlowName(nextFlowName);
        setCanvasUrl(`${N8N_BASE_URL}/workflow/${nextFlowId}`);
        assistantMessage = { content: data.message || `Automation "${nextFlowName}" is live.`, role: 'assistant' };
      } else {
        assistantMessage = { content: 'Failed to create automation. Please try again.', role: 'assistant' };
      }
    } catch {
      assistantMessage = { content: 'Failed to create automation. Please try again.', role: 'assistant' };
    }

    const finalMessages = [...nextMessages, assistantMessage];
    setMessages(finalMessages);
    saveSession({ flowId: nextFlowId, flowName: nextFlowName, lastActivity: Date.now(), messages: finalMessages });
    setSending(false);
  };

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const displayedRecents = recentsExpanded ? recents : recents.slice(0, RECENTS_VISIBLE);

  return (
    <div style={{ background: SIDEBAR_BG, bottom: 0, display: 'flex', height: '100%', left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0, width: '100%' }}>
      {/* Automate sidebar */}
      <div style={{ background: SIDEBAR_BG, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.15s ease', width: sidebarWidth }}>
        <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, height: HEADER_HEIGHT, justifyContent: sidebarCollapsed ? 'center' : 'space-between', paddingInline: 10 }}>
          {!sidebarCollapsed && (
            <span style={{ color: text, fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>
              Automate
            </span>
          )}
          <div
            style={{ alignItems: 'center', borderRadius: 6, cursor: 'pointer', display: 'flex', flexShrink: 0, height: 22, justifyContent: 'center', width: 22 }}
            onClick={() => setSidebarCollapsed((c) => !c)}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {sidebarCollapsed ? <ChevronRight color={textSub} size={14} /> : <ChevronLeft color={textSub} size={14} />}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingInline: 4 }}>
          <SidebarItem
            active={canvasUrl === N8N_BASE_URL}
            collapsed={sidebarCollapsed}
            icon={Home}
            isDark={isDark}
            label="Home"
            onClick={() => setCanvasUrl(N8N_BASE_URL)}
          />
          <SidebarItem
            active={canvasUrl === NEW_FLOW_URL}
            collapsed={sidebarCollapsed}
            icon={Plus}
            isDark={isDark}
            label="New Flow"
            onClick={() => setCanvasUrl(NEW_FLOW_URL)}
          />
          <SidebarItem
            active={canvasUrl === N8N_PROJECT_URL}
            collapsed={sidebarCollapsed}
            icon={Zap}
            isDark={isDark}
            label="My Flows"
            onClick={() => setCanvasUrl(N8N_PROJECT_URL)}
          />
          <SidebarItem
            active={canvasUrl === EXECUTIONS_URL}
            collapsed={sidebarCollapsed}
            icon={Activity}
            isDark={isDark}
            label="Activity"
            onClick={() => setCanvasUrl(EXECUTIONS_URL)}
          />
          <SidebarItem
            active={connectionsOpen}
            collapsed={sidebarCollapsed}
            icon={Plug}
            isDark={isDark}
            label="Connections"
            onClick={() => setConnectionsOpen(true)}
          />
        </div>

        <div style={{ marginTop: 16, paddingInline: 4 }}>
          <div
            style={{
              background: launchOpen ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
              borderRadius: 8,
              cursor: 'pointer',
              display: sidebarCollapsed ? 'flex' : 'block',
              justifyContent: sidebarCollapsed ? 'center' : undefined,
              padding: sidebarCollapsed ? '8px 0' : '8px 10px',
            }}
            onClick={openLaunchPanel}
            onMouseEnter={(e) => { if (!launchOpen) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!launchOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            {sidebarCollapsed ? (
              <Zap color={text} size={18} />
            ) : (
              <>
                <div style={{ color: text, fontSize: 13, fontWeight: 700 }}>Launch</div>
                <div style={{ color: textTertiary, fontSize: 11, fontWeight: 400, marginTop: 2 }}>Think It. Build It.</div>
              </>
            )}
          </div>
        </div>

        {!sidebarCollapsed && (
          <div style={{ marginTop: 8, paddingInline: 4 }}>
            <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', padding: '6px 14px', textTransform: 'uppercase' }}>
              Recent
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: recentsExpanded ? 240 : undefined, overflowY: recentsExpanded ? 'auto' : undefined }}>
              {displayedRecents.map((recent) => (
                <RecentItem isDark={isDark} key={recent.id} recent={recent} onClick={() => openRecent(recent)} />
              ))}
            </div>
            {recents.length > RECENTS_VISIBLE && (
              <div
                style={{ color: textSub, cursor: 'pointer', fontSize: 11, padding: '4px 10px' }}
                onClick={() => setRecentsExpanded((v) => !v)}
              >
                {recentsExpanded ? 'Show less' : 'Show all'}
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBlock: 8, paddingInline: 4 }}>
          <SidebarItem collapsed={sidebarCollapsed} icon={Library} isDark={isDark} label="Library" onClick={() => setLibraryOpen(true)} />
          <SidebarItem
            active={canvasUrl === SETTINGS_URL}
            collapsed={sidebarCollapsed}
            icon={Settings}
            isDark={isDark}
            label="Settings"
            onClick={() => setCanvasUrl(SETTINGS_URL)}
          />
        </div>
      </div>

      {/* Launch panel — slides in between the Automate sidebar and the canvas */}
      <div style={{ flexShrink: 0, overflow: 'hidden', transition: resizing ? 'none' : 'width 0.2s ease', width: launchOpen ? launchWidth : 0 }}>
        <div
          ref={launchPanelRef}
          style={{
            background: SIDEBAR_BG,
            borderRight: `1px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            transform: launchOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: resizing ? 'none' : 'transform 0.2s ease',
            width: launchWidth,
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, height: HEADER_HEIGHT, justifyContent: 'space-between', paddingInline: 10 }}>
            <div
              style={{ alignItems: 'center', borderRadius: 6, cursor: 'pointer', display: 'flex', height: 22, justifyContent: 'center', width: 22 }}
              onClick={closeLaunchPanel}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <ArrowLeft color={textSub} size={16} />
            </div>
            <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
              <div
                style={{ alignItems: 'center', borderRadius: 6, cursor: 'pointer', display: 'flex', height: 22, justifyContent: 'center', width: 22 }}
                title="New conversation"
                onClick={handleNewConversation}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Plus color={textSub} size={16} />
              </div>
              <span style={{ color: textTertiary, fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em' }}>Fi</span>
            </div>
          </div>

          {messages.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', padding: '0 20px' }}>
              <div style={{ color: text, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3, textAlign: 'center' }}>
                Think It. Build It.
              </div>
              <div style={{ color: textSub, fontSize: 12, fontWeight: 400, marginTop: 6, textAlign: 'center' }}>
                Describe your automation. Athena will build it.
              </div>

              <div style={{ height: 180, marginTop: 20, overflow: 'hidden', width: '100%' }}>
                <div className={styles.scrollTrack} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...SUGGESTIONS, ...SUGGESTIONS].map((suggestion, i) => (
                    <div className={styles.suggestionRow} key={i} onClick={() => setDraft(suggestion)}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <ChatBar
                  isDark={isDark}
                  loading={sending}
                  value={draft}
                  onChange={setDraft}
                  onSend={handleSend}
                />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 8, overflowY: 'auto', padding: 12 }}>
                {messages.map((message, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                      background: message.role === 'user' ? '#000' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                      borderRadius: 10,
                      color: message.role === 'user' ? '#fff' : text,
                      fontSize: 13,
                      lineHeight: 1.6,
                      maxWidth: '85%',
                      padding: '8px 12px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.content}
                  </div>
                ))}
                {sending && (
                  <div style={{ alignSelf: 'flex-start', color: textSub, fontSize: 12, fontStyle: 'italic' }}>
                    Building your automation...
                  </div>
                )}
              </div>

              <ChatBar
                multiline
                isDark={isDark}
                loading={sending}
                minHeight="25%"
                value={draft}
                onChange={setDraft}
                onSend={handleSend}
              />
            </>
          )}

          <div
            style={{ bottom: 0, cursor: 'col-resize', position: 'absolute', right: 0, top: 0, width: 4, zIndex: 10 }}
            onMouseDown={onResizeStart}
          />
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src={canvasUrl}
          style={{ border: 'none', height: '100%', width: '100%' }}
          title="Fi Automate"
        />
      </div>

      {connectionsOpen && (
        <IframeModal src={CONNECT_URL} title="Connections" onClose={() => setConnectionsOpen(false)} />
      )}
      {libraryOpen && (
        <IframeModal src={TEMPLATES_URL} title="Library" onClose={() => setLibraryOpen(false)} />
      )}
    </div>
  );
});

AutomatePage.displayName = 'AutomatePage';
export default AutomatePage;
