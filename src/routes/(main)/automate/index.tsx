import { toast } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import {
  Activity,
  Home,
  Library,
  Plug,
  Plus,
  Settings,
  Zap,
} from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  type ChatInputEditor,
  ChatInputProvider,
  DesktopChatInput,
} from '@/features/ChatInput';
import { useIsDark } from '@/hooks/useIsDark';
import { useGlobalStore } from '@/store/global';

const N8N_PROJECT_URL = 'http://localhost:5679/projects/IWCl1gRTE8Zji5i7/workflows';

const SUGGESTIONS = [
  'Send me a Gmail every morning at 8am',
  'Notify me on Slack when I get an email from my boss',
  'Schedule a weekly summary every Friday evening',
  'Monitor my inbox and alert me on Telegram',
  'Post my calendar events to Slack every morning',
  'Send me a Telegram message with my daily tasks',
  'Weekly report every Sunday night to my email',
  'Alert me when I get a message from a VIP contact',
];

const styles = createStaticStyles(({ css, cssVar }) => ({
  pill: css`
    background: ${cssVar.colorFillTertiary};
    border: 0.5px solid ${cssVar.colorBorder};
    border-radius: 20px;
    color: ${cssVar.colorTextTertiary};
    font-size: 11px;
    line-height: 1.4;
    padding: 7px 14px;
    text-align: center;
  `,
  scrollTrack: css`
    animation: automate-scroll-suggestions 18s linear infinite;

    @keyframes automate-scroll-suggestions {
      0% {
        transform: translateY(0);
      }

      100% {
        transform: translateY(-50%);
      }
    }
  `,
}));

interface SidebarItemProps {
  active?: boolean;
  icon: any;
  isDark: boolean;
  label: string;
  onClick?: () => void;
}

const SidebarItem = memo<SidebarItemProps>(({ icon: Icon, label, isDark, active, onClick }) => {
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  return (
    <div
      style={{
        alignItems: 'center',
        background: active ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        gap: 8,
        height: 36,
        paddingInline: 10,
      }}
      onClick={onClick}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, height: 28, justifyContent: 'center', width: 28 }}>
        <Icon color={active ? text : textSub} size={18} />
      </div>
      <span style={{ color: active ? text : textSub, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

const AutomatePage = memo(() => {
  const isDark = useIsDark();
  const navigate = useNavigate();

  const [launchOpen, setLaunchOpen] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState(N8N_PROJECT_URL);
  const [sending, setSending] = useState(false);

  const editorRef = useRef<ChatInputEditor | null>(null);
  const contentRef = useRef('');

  const bg = isDark ? '#0d0d0d' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
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

  const handleSend = useCallback(async () => {
    const prompt = contentRef.current.trim();
    if (!prompt || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/dev/automate-test', {
        body: JSON.stringify({ connectedApps: [], prompt }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create automation');

      toast.success(`✓ Automation live: ${data.workflowName}`);
      editorRef.current?.clearContent();
      contentRef.current = '';
    } catch {
      toast.error('Failed to create automation');
    } finally {
      setSending(false);
    }
  }, [sending]);

  const sendButtonProps = {
    disabled: sending,
    generating: sending,
    onStop: () => {},
    shape: 'round' as const,
  };

  return (
    <div style={{ background: bg, bottom: 0, display: 'flex', height: '100%', left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0, width: '100%' }}>
      {/* Automate sidebar */}
      <div style={{ background: bg, borderRight: `0.5px solid ${border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, width: 220 }}>
        <div style={{ padding: '8px 10px' }}>
          <span style={{ color: text, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>Automate</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingInline: 8 }}>
          <SidebarItem icon={Home} isDark={isDark} label="Home" onClick={() => navigate('/')} />
          <SidebarItem icon={Plus} isDark={isDark} label="New Flow" onClick={() => setLaunchOpen(true)} />
          <SidebarItem
            active={canvasUrl === N8N_PROJECT_URL}
            icon={Zap}
            isDark={isDark}
            label="My Flows"
            onClick={() => setCanvasUrl(N8N_PROJECT_URL)}
          />
          <SidebarItem
            icon={Activity}
            isDark={isDark}
            label="Activity"
            onClick={() => setCanvasUrl('http://localhost:5679/projects/IWCl1gRTE8Zji5i7/executions')}
          />
        </div>

        <div style={{ marginTop: 16, paddingInline: 8 }}>
          <div
            style={{ borderRadius: 8, cursor: 'pointer', padding: '8px 10px' }}
            onClick={() => setLaunchOpen(true)}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ color: text, fontSize: 13, fontWeight: 700 }}>Launch</div>
            <div style={{ color: textTertiary, fontSize: 10, marginTop: 2 }}>Think It. Build It.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 16, paddingInline: 8 }}>
          <SidebarItem
            icon={Plug}
            isDark={isDark}
            label="Connections"
            onClick={() => navigate('/connect')}
          />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBlock: 8, paddingInline: 8 }}>
          <SidebarItem icon={Library} isDark={isDark} label="Library" />
          <SidebarItem icon={Settings} isDark={isDark} label="Settings" onClick={() => navigate('/settings')} />
        </div>
      </div>

      {/* Launch panel — slides in between the Automate sidebar and the canvas */}
      <div style={{ flexShrink: 0, overflow: 'hidden', transition: 'width 0.2s ease', width: launchOpen ? 240 : 0 }}>
        <div
          style={{
            background: bg,
            borderRight: `0.5px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transform: launchOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
            width: 240,
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
            <div style={{ color: text, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3, textAlign: 'center' }}>
              Think It. Build It.
            </div>
            <div style={{ color: textSub, fontSize: 11, marginTop: 6, textAlign: 'center' }}>
              Describe your automation. Athena will build it.
            </div>

            <div style={{ height: 220, marginTop: 16, overflow: 'hidden', width: '100%' }}>
              <div className={styles.scrollTrack} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...SUGGESTIONS, ...SUGGESTIONS].map((suggestion, i) => (
                  <div className={styles.pill} key={i}>
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '10px 10px 14px' }}>
            <ChatInputProvider
              allowExpand={false}
              sendButtonProps={sendButtonProps}
              chatInputEditorRef={(instance) => {
                editorRef.current = instance;
              }}
              onSend={() => void handleSend()}
              onMarkdownContentChange={(content) => {
                contentRef.current = content;
              }}
            >
              <DesktopChatInput
                placeholder="Describe an automation..."
                showRuntimeConfig={false}
              />
            </ChatInputProvider>
          </div>
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
    </div>
  );
});

AutomatePage.displayName = 'AutomatePage';
export default AutomatePage;
