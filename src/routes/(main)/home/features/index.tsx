'use client';
import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import { ChatList, ConversationProvider } from '@/features/Conversation';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useOperationState } from '@/hooks/useOperationState';
import { useIsDark } from '@/hooks/useIsDark';
import { useChatStore } from '@/store/chat';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useActiveConversationStore } from '@/store/home/activeConversation';
import InputArea from './InputArea';

const MAX_WIDTH = 860;

const INCOGNITO_KEY = 'fi-incognito-mode';

/* ═══════════════════════════════════════════════
   CONNECT BAR — 5 options, uncomment to switch
   ═══════════════════════════════════════════════ */

// OPTION 1 — Borderless floating (no box)
const GmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16v16H4V4z" fill="white"/>
    <path d="M4 4l8 7 8-7" stroke="#EA4335" strokeWidth="1.5"/>
    <path d="M4 4v16h3.5V9.5L12 13l4.5-3.5V20H20V4" fill="#4285F4"/>
    <path d="M4 4v16h3.5V9.5L12 13l4.5-3.5V20H20V4H4z" fill="none"/>
    <path d="M4 20V4l8 7 8-7v16" fill="none" stroke="none"/>
    <rect x="4" y="4" width="16" height="16" fill="none"/>
    <path d="M4 6.5L12 12l8-5.5V20H4V6.5z" fill="#fff"/>
    <path d="M4 4l8 6.5L20 4H4z" fill="#EA4335"/>
    <path d="M4 4v2.5L12 12l8-5.5V4H4z" fill="#EA4335"/>
    <path d="M4 6.5V20h3.2V10.2L12 13.5l4.8-3.3V20H20V6.5L12 12 4 6.5z" fill="#4285F4"/>
  </svg>
);
const DriveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M4.5 19.5l2.25-3.9h10.5l2.25 3.9H4.5z" fill="#0066DA"/>
    <path d="M8.25 4.5L3 13.5l2.25 3.9L10.5 8.4 8.25 4.5z" fill="#00AC47"/>
    <path d="M15.75 4.5H8.25l2.25 3.9h5.25L18 4.5h-2.25z" fill="#FFBA00"/>
    <path d="M13.5 8.4L18 16.5l-2.25 3-5.25-9.06L13.5 8.4z" fill="#EA4335"/>
    <path d="M18 16.5H6.75l-1.5 3h13.5L18 16.5z" fill="#00832D"/>
    <path d="M5.25 16.5L10.5 8.4 8.25 4.5 3 13.5l2.25 3z" fill="#2DA94F"/>
  </svg>
);

const ConnectOption1 = ({ onDismiss, isDark = false }: { onDismiss: () => void; isDark?: boolean }) => (
  <div style={{ alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, width: '100%', maxWidth: MAX_WIDTH, paddingInline: 20, flexWrap: 'nowrap' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <Telegram.Color size={20} />
      <Slack.Color size={20} />
      <Discord.Color size={20} />
      <GmailIcon />
      <DriveIcon />
    </div>
    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)', fontSize: 13 }}>Connect Fi to your channels & apps</span>
    <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: 'none', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)', borderRadius: 20, color: isDark ? '#fff' : '#111', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '5px 16px' }}>Connect →</button>
    <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
  </div>
);

// OPTION 2 — Thin underline bar
const ConnectOption2 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 16, maxWidth: MAX_WIDTH, paddingBlock: 12, paddingInline: 4, width: 'calc(100% - 40px)' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <Telegram.Color size={16} /><Slack.Color size={16} /><Discord.Color size={16} />
      <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 12 }}>Deploy Fi on Telegram, Slack, Discord</span>
    </div>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: '#111', border: 'none', borderRadius: 16, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '4px 12px' }}>Set up</button>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.25)', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  </div>
);

// OPTION 3 — Frosted glass pill (DEFAULT)
const ConnectOption3 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 10, maxWidth: MAX_WIDTH, padding: '10px 10px 10px 18px', width: 'calc(100% - 40px)' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8, flex: 1 }}>
      <Telegram.Color size={20} /><Slack.Color size={20} /><Discord.Color size={20} />
      <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: 13 }}>Connect Fi to <b style={{ color: '#111' }}>Telegram, Slack, Discord</b> and more</span>
    </div>
    <div style={{ alignItems: 'center', display: 'flex', gap: 4, flexShrink: 0 }}>
      <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', borderRadius: 20, color: 'rgba(0,0,0,0.35)', cursor: 'pointer', fontSize: 12, padding: '6px 10px' }}>Dismiss</button>
      <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: '#111', border: 'none', borderRadius: 20, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 18px' }}>Connect →</button>
    </div>
  </div>
);

// OPTION 4 — Icon strip only (ultra minimal)
const ConnectOption4 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
    {[{ icon: <Telegram.Color size={28} />, label: 'Telegram' }, { icon: <Slack.Color size={28} />, label: 'Slack' }, { icon: <Discord.Color size={28} />, label: 'Discord' }].map((p) => (
      <button key={p.label} onClick={() => window.location.href = '/settings/messenger'} style={{ alignItems: 'center', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 16px', transition: 'background 0.15s' }} title={`Connect ${p.label}`}>
        {p.icon}
        <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 11 }}>{p.label}</span>
      </button>
    ))}
    <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: 18, marginLeft: 4 }}>×</button>
  </div>
);

// OPTION 5 — Dark accent bar (inverted)
const ConnectOption5 = ({ onDismiss }: { onDismiss: () => void }) => (
  <div style={{ alignItems: 'center', background: '#111', borderRadius: 32, display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 10, maxWidth: MAX_WIDTH, padding: '10px 10px 10px 18px', width: 'calc(100% - 40px)' }}>
    <div style={{ alignItems: 'center', display: 'flex', gap: 8, flex: 1 }}>
      <Telegram.Color size={20} /><Slack.Color size={20} /><Discord.Color size={20} />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Deploy Fi on <b style={{ color: '#fff' }}>Telegram, Slack, Discord</b></span>
    </div>
    <div style={{ alignItems: 'center', display: 'flex', gap: 4, flexShrink: 0 }}>
      <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', borderRadius: 20, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, padding: '6px 10px' }}>Dismiss</button>
      <button onClick={() => window.location.href = '/settings/messenger'} style={{ background: '#fff', border: 'none', borderRadius: 20, color: '#111', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 18px' }}>Connect →</button>
    </div>
  </div>
);

const Home = memo(() => {
  const [incognito, setIncognito] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const isDark = useIsDark();

  // Active conversation — written by useSend (new message) or sidebar recents click
  const chatContext = useActiveConversationStore((s) => s.conversation);
  const hasStarted = chatContext !== null;

  // Operation state for ConversationProvider
  const chatContextKey = chatContext ? messageMapKey(chatContext) : null;
  const replaceMessages = useChatStore((s) => s.replaceMessages);
  const operationState = useOperationState(chatContext ?? { agentId: '' });

  useEffect(() => {
    if (!chatContextKey || !chatContext) return;
    console.log('[Fi] Loading messages for context:', chatContextKey, chatContext);
    useChatStore.getState().refreshMessages(chatContext);
  }, [chatContextKey]);

  useEffect(() => {
    if (!chatContext) return;
    // Sync active agent and topic so ConversationProvider's internal fetch works
    useChatStore.setState(
      { activeAgentId: chatContext.agentId, activeTopicId: chatContext.topicId ?? null },
      false,
      'Home/syncActiveConversation',
    );
  }, [chatContext?.agentId, chatContext?.topicId]);

  useEffect(() => {
    if (localStorage.getItem(INCOGNITO_KEY) === 'true') setIncognito(true);
  }, []);

  const toggleIncognito = useCallback(() => {
    setIncognito((prev) => {
      const next = !prev;
      localStorage.setItem(INCOGNITO_KEY, String(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    });
  }, []);

  const incognitoOverlay = incognito && !hasStarted && (
    <>
      <style>{`
        .acss-12lasj6, [data-insp-path*="NavPanelDraggable"] {
          filter: blur(5px) !important;
          transition: filter 0.3s ease !important;
        }
      `}</style>
      <div style={{ bottom: 0, cursor: 'not-allowed', left: 0, position: 'fixed', top: 0, width: 260, zIndex: 50 }} onClick={(e) => e.stopPropagation()} />
    </>
  );

  const incognitoButton = !incognito && !hasStarted && (
    <button onClick={toggleIncognito} title="Incognito mode"
      style={{ alignItems: 'center', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', padding: 7, position: 'absolute', right: 4, top: 8, zIndex: 10 }}>
      <img src={isDark ? '/logos/incognito-icon-white.svg' : '/logos/incognito-icon.svg'} alt="incognito" style={{ height: 20, opacity: 0.5, width: 20 }} />
    </button>
  );

  const incognitoBanner = incognito && !hasStarted && (
    <div style={{ alignItems: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', borderRadius: 24, color: '#fff', display: 'flex', gap: 8, padding: '6px 12px 6px 14px', position: 'absolute', right: 12, top: 12, zIndex: 10 }}>
      <img src="/logos/incognito-icon-white.svg" alt="incognito" style={{ height: 16, width: 16 }} />
      <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.9 }}>Off the record</span>
      <button onClick={toggleIncognito} style={{ alignItems: 'center', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', height: 18, justifyContent: 'center', marginLeft: 2, padding: 0, width: 18 }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );

  if (hasStarted && chatContext) {
    return (
      <div style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', transition: 'background 0.2s ease', width: '100%' }}>
        {incognitoOverlay}
        {incognitoButton}
        {incognitoBanner}
        <ConversationProvider
          context={chatContext}
          operationState={operationState}
          skipFetch={false}
          onMessagesChange={(msgs, ctx) => replaceMessages(msgs, { context: ctx })}
        >
          {/* Messages — scrollable, takes all available space */}
          <div style={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}>
            <div style={{ margin: '0 auto', maxWidth: 860, paddingInline: 20, width: '100%' }}>
              <ChatList />
            </div>
          </div>
          {/* Input fixed at bottom */}
          <div style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', flexShrink: 0, paddingBlock: 8, paddingInline: 0, transition: 'background 0.2s ease' }}>
            <div style={{ margin: '0 auto', maxWidth: 777, marginBottom: 4, width: '100%' }}>
              <InputArea incognito={incognito} />
            </div>
            {incognito && (
              <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', fontSize: 12, fontWeight: 500, marginTop: 8, textAlign: 'center' }}>
                Off the record
              </div>
            )}
          <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11, marginTop: 6, paddingBottom: 6, textAlign: 'center' }}>
              Fi is AI and can make mistakes. Please verify important responses.
            </div>
          </div>
        </ConversationProvider>
      </div>
    );
  }

  return (
    <div style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', transition: 'background 0.2s ease', width: '100%' }}>
      {incognitoOverlay}
      {incognitoButton}
      {incognitoBanner}

      {/* Pre-chat: centered logo + input */}
      <div style={{ alignItems: 'center', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', minHeight: 0, overflow: 'hidden', paddingBottom: 160, width: '100%' }}>
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', paddingInline: 20, width: '100%', maxWidth: 860 }}>
          {/* Fi logo */}
          <div style={{ marginBottom: 28, textAlign: 'center', userSelect: 'none' }}>
            <img src={isDark ? '/logos/fi-icon-white.svg' : '/logos/fi-icon-black.svg'} alt="Fi" style={{ height: 72, width: 'auto' }} />
          </div>

          {/* Input */}
          <div style={{ maxWidth: 860, paddingInline: 20, position: 'relative', width: '100%' }}>
            <InputArea incognito={incognito} />
            {incognito && (
              <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', fontSize: 12, fontWeight: 500, marginTop: 8, textAlign: 'center' }}>
                Off the record
              </div>
            )}
          </div>

          {/* Connect bar */}
          {!bannerDismissed && <ConnectOption1 onDismiss={() => setBannerDismissed(true)} isDark={isDark} />}
        </div>
      </div>
    </div>
  );
});

export default Home;
