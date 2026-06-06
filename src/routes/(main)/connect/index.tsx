'use client';

import { memo, useState } from 'react';
import { Search, X, Check, Key } from 'lucide-react';
import { signIn } from '@/libs/better-auth/auth-client';
import { useIsDark } from '@/hooks/useIsDark';
import { useToolStore } from '@/store/tool';

const MCP_APPS = [
  // Creative & Media
  { id: 'higgsfield', name: 'Higgsfield', desc: 'AI video generation — Sora, Veo3, Kling, 30+ models', category: 'Creative', url: 'https://mcp.higgsfield.ai/mcp', logo: 'https://www.google.com/s2/favicons?domain=higgsfield.ai', auth: 'oauth' },
  { id: 'canva', name: 'Canva', desc: 'Create designs, presentations and visual content', category: 'Creative', url: 'https://mcp.canva.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=canva.com', auth: 'oauth' },
  { id: 'figma', name: 'Figma', desc: 'Design files, components and prototypes', category: 'Creative', url: 'https://mcp.figma.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=figma.com', auth: 'oauth' },
  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'AI voice generation and text to speech', category: 'Creative', url: 'https://elevenlabs.io', logo: 'https://www.google.com/s2/favicons?domain=elevenlabs.io', auth: 'apikey' },
  { id: 'runway', name: 'Runway', desc: 'AI video and image generation tools', category: 'Creative', url: 'https://runwayml.com', logo: 'https://www.google.com/s2/favicons?domain=runwayml.com', auth: 'apikey' },
  // Communication
  { id: 'slack', name: 'Slack', desc: 'Send messages, search conversations, manage channels', category: 'Communication', url: 'https://mcp.slack.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=slack.com', auth: 'oauth' },
  { id: 'discord', name: 'Discord', desc: 'Messaging, servers and community management', category: 'Communication', url: 'https://discord.com', logo: 'https://www.google.com/s2/favicons?domain=discord.com', auth: 'apikey' },
  { id: 'telegram', name: 'Telegram', desc: 'Messaging and bot automation', category: 'Communication', url: 'https://telegram.org', logo: 'https://www.google.com/s2/favicons?domain=telegram.org', auth: 'apikey' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Business messaging and customer engagement', category: 'Communication', url: 'https://business.whatsapp.com', logo: 'https://www.google.com/s2/favicons?domain=whatsapp.com', auth: 'apikey' },
  // Productivity
  { id: 'notion', name: 'Notion', desc: 'Read and write pages, databases and workspaces', category: 'Productivity', url: 'https://mcp.notion.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=notion.so', auth: 'oauth' },
  { id: 'asana', name: 'Asana', desc: 'Projects, tasks and team workflow management', category: 'Productivity', url: 'https://mcp.asana.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=asana.com', auth: 'oauth' },
  { id: 'linear', name: 'Linear', desc: 'Issues, projects, cycles and team management', category: 'Productivity', url: 'https://mcp.linear.app/mcp', logo: 'https://www.google.com/s2/favicons?domain=linear.app', auth: 'oauth' },
  { id: 'monday', name: 'Monday.com', desc: 'Boards, items and project tracking', category: 'Productivity', url: 'https://mcp.monday.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=monday.com', auth: 'oauth' },
  { id: 'clickup', name: 'ClickUp', desc: 'Tasks, docs and project collaboration', category: 'Productivity', url: 'https://clickup.com', logo: 'https://www.google.com/s2/favicons?domain=clickup.com', auth: 'apikey' },
  { id: 'box', name: 'Box', desc: 'Enterprise file storage, metadata and sharing', category: 'Productivity', url: 'https://mcp.box.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=box.com', auth: 'oauth' },
  { id: 'dropbox', name: 'Dropbox', desc: 'Cloud file storage and collaboration', category: 'Productivity', url: 'https://dropbox.com', logo: 'https://www.google.com/s2/favicons?domain=dropbox.com', auth: 'apikey' },
  { id: 'airtable', name: 'Airtable', desc: 'Database, spreadsheet and workflow platform', category: 'Productivity', url: 'https://airtable.com', logo: 'https://www.google.com/s2/favicons?domain=airtable.com', auth: 'apikey' },
  // CRM & Sales
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM contacts, deals and marketing pipelines', category: 'CRM', url: 'https://mcp.hubspot.com', logo: 'https://www.google.com/s2/favicons?domain=hubspot.com', auth: 'oauth' },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM leads, opportunities and contacts', category: 'CRM', url: 'https://mcp.salesforce.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=salesforce.com', auth: 'oauth' },
  { id: 'clay', name: 'Clay', desc: 'Data enrichment, lead lists and CRM sync', category: 'CRM', url: 'https://mcp.clay.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=clay.run', auth: 'oauth' },
  { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets and interactions', category: 'CRM', url: 'https://zendesk.com', logo: 'https://www.google.com/s2/favicons?domain=zendesk.com', auth: 'apikey' },
  { id: 'intercom', name: 'Intercom', desc: 'Customer messaging and support platform', category: 'CRM', url: 'https://intercom.com', logo: 'https://www.google.com/s2/favicons?domain=intercom.com', auth: 'apikey' },
  // Developer Tools
  { id: 'github', name: 'GitHub', desc: 'Repositories, issues, PRs and workflows', category: 'Developer', url: 'https://api.githubcopilot.com/mcp/', logo: 'https://www.google.com/s2/favicons?domain=github.com', auth: 'oauth' },
  { id: 'gitlab', name: 'GitLab', desc: 'Repository, CI/CD and DevOps platform', category: 'Developer', url: 'https://gitlab.com', logo: 'https://www.google.com/s2/favicons?domain=gitlab.com', auth: 'apikey' },
  { id: 'vercel', name: 'Vercel', desc: 'Deployments, logs and environments', category: 'Developer', url: 'https://mcp.vercel.com', logo: 'https://www.google.com/s2/favicons?domain=vercel.com', auth: 'oauth' },
  { id: 'sentry', name: 'Sentry', desc: 'Error tracking, issues and performance', category: 'Developer', url: 'https://mcp.sentry.dev/mcp', logo: 'https://www.google.com/s2/favicons?domain=sentry.io', auth: 'oauth' },
  { id: 'supabase', name: 'Supabase', desc: 'Database, auth, storage and realtime', category: 'Developer', url: 'https://mcp.supabase.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=supabase.com', auth: 'oauth' },
  { id: 'cloudflare', name: 'Cloudflare', desc: 'Workers, KV storage and DNS management', category: 'Developer', url: 'https://mcp.cloudflare.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=cloudflare.com', auth: 'oauth' },
  { id: 'neon', name: 'Neon', desc: 'Serverless Postgres with branching', category: 'Developer', url: 'https://mcp.neon.tech/mcp', logo: 'https://www.google.com/s2/favicons?domain=neon.tech', auth: 'oauth' },
  { id: 'atlassian', name: 'Jira & Confluence', desc: 'Issues, tickets and team documentation', category: 'Developer', url: 'https://mcp.atlassian.com/v1/mcp', logo: 'https://www.google.com/s2/favicons?domain=atlassian.com', auth: 'oauth' },
  { id: 'postman', name: 'Postman', desc: 'API development and testing platform', category: 'Developer', url: 'https://postman.com', logo: 'https://www.google.com/s2/favicons?domain=postman.com', auth: 'apikey' },
  { id: 'aws', name: 'AWS', desc: 'Cloud infrastructure and services', category: 'Developer', url: 'https://aws.amazon.com', logo: 'https://www.google.com/s2/favicons?domain=aws.amazon.com', auth: 'apikey' },
  // Finance & Payments
  { id: 'stripe', name: 'Stripe', desc: 'Payments, subscriptions and invoices', category: 'Finance', url: 'https://mcp.stripe.com', logo: 'https://www.google.com/s2/favicons?domain=stripe.com', auth: 'oauth' },
  { id: 'paypal', name: 'PayPal', desc: 'Payments, invoices and transactions', category: 'Finance', url: 'https://mcp.paypal.com/http', logo: 'https://www.google.com/s2/favicons?domain=paypal.com', auth: 'oauth' },
  { id: 'cashfree', name: 'Cashfree', desc: 'Payment gateway and payouts (India)', category: 'Finance', url: 'https://mcp.cashfree.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=cashfree.com', auth: 'oauth' },
  { id: 'razorpay', name: 'Razorpay', desc: 'Payment gateway for India', category: 'Finance', url: 'https://razorpay.com', logo: 'https://www.google.com/s2/favicons?domain=razorpay.com', auth: 'apikey' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting and financial management', category: 'Finance', url: 'https://quickbooks.intuit.com', logo: 'https://www.google.com/s2/favicons?domain=quickbooks.intuit.com', auth: 'apikey' },
  // Analytics
  { id: 'amplitude', name: 'Amplitude', desc: 'Product analytics, user journeys and A/B testing', category: 'Analytics', url: 'https://mcp.amplitude.com/mcp', logo: 'https://www.google.com/s2/favicons?domain=amplitude.com', auth: 'oauth' },
  { id: 'hex', name: 'Hex', desc: 'Data notebooks, analytics and interactive charts', category: 'Analytics', url: 'https://mcp.hex.tech/mcp', logo: 'https://www.google.com/s2/favicons?domain=hex.tech', auth: 'oauth' },
  { id: 'mixpanel', name: 'Mixpanel', desc: 'Product analytics and user behaviour', category: 'Analytics', url: 'https://mixpanel.com', logo: 'https://www.google.com/s2/favicons?domain=mixpanel.com', auth: 'apikey' },
  { id: 'googleanalytics', name: 'Google Analytics', desc: 'Web analytics and reporting', category: 'Analytics', url: 'https://analytics.google.com', logo: 'https://www.google.com/s2/favicons?domain=analytics.google.com', auth: 'apikey' },
  // Google Workspace — use Better Auth Google social sign-in
  { id: 'gmail', name: 'Gmail', desc: 'Read, compose and manage your emails', category: 'Google', url: 'https://gmailmcp.googleapis.com/mcp/v1', logo: 'https://www.google.com/s2/favicons?domain=gmail.com', auth: 'google' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Search, read and upload files', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'https://www.google.com/s2/favicons?domain=drive.google.com', auth: 'google' },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Manage events and schedule meetings', category: 'Google', url: 'https://calendarmcp.googleapis.com/mcp/v1', logo: 'https://www.google.com/s2/favicons?domain=calendar.google.com', auth: 'google' },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets and data analysis', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'https://www.google.com/s2/favicons?domain=sheets.google.com', auth: 'google' },
  { id: 'gdocs', name: 'Google Docs', desc: 'Documents and collaborative writing', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'https://www.google.com/s2/favicons?domain=docs.google.com', auth: 'google' },
  // Microsoft — use Better Auth Microsoft social sign-in
  { id: 'outlook', name: 'Outlook', desc: 'Email, calendar and contacts', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'https://www.google.com/s2/favicons?domain=outlook.com', auth: 'microsoft' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Cloud file storage and sharing', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'https://www.google.com/s2/favicons?domain=onedrive.live.com', auth: 'microsoft' },
  { id: 'teams', name: 'Microsoft Teams', desc: 'Team messaging and video meetings', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'https://www.google.com/s2/favicons?domain=teams.microsoft.com', auth: 'microsoft' },
  { id: 'excel', name: 'Microsoft Excel', desc: 'Spreadsheets and data analysis', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'https://www.google.com/s2/favicons?domain=office.com', auth: 'microsoft' },
  // Social & Content
  { id: 'youtube', name: 'YouTube', desc: 'Video search, transcripts and metadata', category: 'Social', url: 'https://youtube.com', logo: 'https://www.google.com/s2/favicons?domain=youtube.com', auth: 'apikey' },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Post, search and manage tweets', category: 'Social', url: 'https://x.com', logo: 'https://www.google.com/s2/favicons?domain=x.com', auth: 'apikey' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional network and content', category: 'Social', url: 'https://linkedin.com', logo: 'https://www.google.com/s2/favicons?domain=linkedin.com', auth: 'apikey' },
  { id: 'wordpress', name: 'WordPress', desc: 'CMS and blog management', category: 'Social', url: 'https://wordpress.com', logo: 'https://www.google.com/s2/favicons?domain=wordpress.com', auth: 'apikey' },
  // AI Tools
  { id: 'openai', name: 'OpenAI', desc: 'GPT models, DALL-E and Whisper', category: 'AI', url: 'https://openai.com', logo: 'https://www.google.com/s2/favicons?domain=openai.com', auth: 'apikey' },
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude AI models and APIs', category: 'AI', url: 'https://anthropic.com', logo: 'https://www.google.com/s2/favicons?domain=anthropic.com', auth: 'apikey' },
  { id: 'stability', name: 'Stability AI', desc: 'Image generation models', category: 'AI', url: 'https://stability.ai', logo: 'https://www.google.com/s2/favicons?domain=stability.ai', auth: 'apikey' },
  { id: 'replicate', name: 'Replicate', desc: 'Run AI models in the cloud', category: 'AI', url: 'https://replicate.com', logo: 'https://www.google.com/s2/favicons?domain=replicate.com', auth: 'apikey' },
  { id: 'huggingface', name: 'Hugging Face', desc: 'Open source AI models and datasets', category: 'AI', url: 'https://huggingface.co', logo: 'https://www.google.com/s2/favicons?domain=huggingface.co', auth: 'apikey' },
];

type AppAuth = 'oauth' | 'google' | 'microsoft' | 'apikey';
interface McpApp { id: string; name: string; desc: string; category: string; url: string; logo: string; auth: AppAuth }

const CATEGORIES = ['All', 'Creative', 'Communication', 'Productivity', 'CRM', 'Developer', 'Finance', 'Analytics', 'Google', 'Microsoft', 'Social', 'AI'];

const AppIcon = ({ logo, name }: { logo: string; name: string }) => {
  const isDark = useIsDark();
  return (
    <div style={{
      alignItems: 'center',
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 8,
      display: 'flex',
      flexShrink: 0,
      height: 36,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 36,
    }}>
      <img
        src={logo}
        alt={name}
        style={{ height: 22, objectFit: 'contain', width: 22 }}
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          if (el.parentElement) {
            el.parentElement.innerHTML = `<span style="font-size:11px;font-weight:500;color:var(--color-text-tertiary)">${name.slice(0,2).toUpperCase()}</span>`;
          }
        }}
      />
    </div>
  );
};

const ConnectPage = memo(() => {
  const isDark = useIsDark();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [connected, setConnected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [apiKeyModal, setApiKeyModal] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const installCustomPlugin = useToolStore((s) => s.installCustomPlugin);

  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

  const apps = MCP_APPS as McpApp[];

  const filtered = apps.filter((app) => {
    const matchSearch = !search.trim() ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.desc.toLowerCase().includes(search.toLowerCase()) ||
      app.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || app.category === activeCategory;
    return matchSearch && matchCat;
  });

  const connectedApps = apps.filter(a => connected.includes(a.id));
  const unconnectedFiltered = filtered.filter(a => !connected.includes(a.id));

  const handleConnect = async (app: McpApp) => {
    if (app.auth === 'google') {
      setConnecting(app.id);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await signIn.social({ callbackURL: '/connect', provider: 'google' as any });
        setConnected(prev => [...prev, app.id]);
      } catch (e) {
        console.error('Google sign-in error:', e);
      } finally {
        setConnecting(null);
      }
      return;
    }

    if (app.auth === 'microsoft') {
      setConnecting(app.id);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await signIn.social({ callbackURL: '/connect', provider: 'microsoft' as any });
        setConnected(prev => [...prev, app.id]);
      } catch (e) {
        console.error('Microsoft sign-in error:', e);
      } finally {
        setConnecting(null);
      }
      return;
    }

    if (app.auth === 'oauth') {
      setConnecting(app.id);
      try {
        await installCustomPlugin({
          customParams: {
            description: app.desc,
            mcp: {
              auth: { type: 'none' },
              type: 'http',
              url: app.url,
            },
          },
          identifier: `connect-${app.id}`,
          type: 'customPlugin',
        });
        setConnected(prev => [...prev, app.id]);
      } catch (e) {
        console.error('MCP install error:', e);
      } finally {
        setConnecting(null);
      }
      return;
    }

    // apikey — open modal
    setApiKeyModal(app.id);
    setApiKeyValue('');
  };

  const handleDisconnect = (id: string) => {
    setConnected(prev => prev.filter(x => x !== id));
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyModal || !apiKeyValue.trim()) return;
    const app = apps.find(a => a.id === apiKeyModal);
    if (!app) return;
    setSavingKey(true);
    try {
      await installCustomPlugin({
        customParams: {
          description: app.desc,
          mcp: {
            auth: { token: apiKeyValue.trim(), type: 'bearer' },
            type: 'http',
            url: app.url,
          },
        },
        identifier: `connect-${app.id}`,
        type: 'customPlugin',
      });
      setConnected(prev => [...prev, apiKeyModal]);
      setApiKeyModal(null);
      setApiKeyValue('');
    } catch (e) {
      console.error('API key save error:', e);
    } finally {
      setSavingKey(false);
    }
  };

  const groupedByCategory: Record<string, McpApp[]> = {};
  unconnectedFiltered.forEach(app => {
    if (!groupedByCategory[app.category]) groupedByCategory[app.category] = [];
    groupedByCategory[app.category].push(app);
  });

  const modalApp = apps.find(a => a.id === apiKeyModal);

  return (
    <div style={{ background: bg, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: isDark ? '#1e1e1d' : '#ffffff', borderBottom: `0.5px solid ${border}`, flexShrink: 0, padding: '20px 32px 16px' }}>
        <div style={{ alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: text, fontSize: 20, fontWeight: 500, margin: 0 }}>Connect</h1>
            <p style={{ color: textSub, fontSize: 13, margin: '4px 0 0' }}>
              Connect Fi to your apps and services. OAuth apps connect with a single login — no API keys needed.
            </p>
          </div>
          <div style={{ color: textTertiary, fontSize: 12 }}>{MCP_APPS.length}+ integrations</div>
        </div>

        {/* Search + Categories */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
          <div style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 10, display: 'flex', gap: 8, padding: '7px 12px', width: 280, flexShrink: 0 }}>
            <Search size={14} style={{ color: textTertiary, flexShrink: 0 }} />
            <input
              placeholder="Search connectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 13, outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: textTertiary, cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? text : 'transparent',
                  border: `0.5px solid ${activeCategory === cat ? 'transparent' : border}`,
                  borderRadius: 20,
                  color: activeCategory === cat ? bg : textSub,
                  cursor: 'pointer',
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '5px 14px',
                  transition: 'all 0.15s',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px 40px' }}>

        {/* Connected section */}
        {connectedApps.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Connected</span>
              <span style={{ background: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.1)', borderRadius: 10, color: isDark ? '#4ade80' : '#16a34a', fontSize: 11, padding: '1px 7px' }}>{connectedApps.length}</span>
            </div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {connectedApps.map(app => (
                <div key={app.id} style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${isDark ? 'rgba(74,222,128,0.3)' : 'rgba(22,163,74,0.2)'}`, borderRadius: 12, display: 'flex', gap: 12, padding: '12px 14px' }}>
                  <AppIcon logo={app.logo} name={app.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                      <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                      <Check size={12} style={{ color: isDark ? '#4ade80' : '#16a34a' }} />
                    </div>
                    <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  </div>
                  <button onClick={() => handleDisconnect(app.id)}
                    style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grouped categories */}
        {Object.entries(groupedByCategory).map(([category, categoryApps]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>{category}</div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {categoryApps.map(app => {
                const isConnecting = connecting === app.id;
                return (
                  <div key={app.id}
                    style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, cursor: isConnecting ? 'wait' : 'pointer', display: 'flex', gap: 12, padding: '12px 14px', transition: 'border-color 0.1s' }}
                    onMouseEnter={e => { if (!isConnecting) e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = border; }}
                    onClick={() => { if (!isConnecting) void handleConnect(app); }}>
                    <AppIcon logo={app.logo} name={app.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                        <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                        {app.auth === 'apikey' && (
                          <span style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `0.5px solid ${border}`, borderRadius: 6, color: textTertiary, display: 'flex', fontSize: 10, gap: 3, padding: '1px 6px' }}>
                            <Key size={9} /> API key
                          </span>
                        )}
                      </div>
                      <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                    </div>
                    <button
                      disabled={isConnecting}
                      style={{ background: text, border: 'none', borderRadius: 8, color: bg, cursor: isConnecting ? 'wait' : 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 500, opacity: isConnecting ? 0.6 : 1, padding: '5px 12px', whiteSpace: 'nowrap' }}>
                      {isConnecting ? '...' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ color: textSub, fontSize: 13, padding: '60px 0', textAlign: 'center' }}>
            No connectors found for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {apiKeyModal && modalApp && (
        <div style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 }}>
          <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', padding: '24px', width: 400 }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 20 }}>
              <AppIcon logo={modalApp.logo} name={modalApp.name} />
              <div>
                <div style={{ color: text, fontSize: 15, fontWeight: 500 }}>Connect {modalApp.name}</div>
                <div style={{ color: textSub, fontSize: 12, marginTop: 2 }}>Enter your API key to connect</div>
              </div>
            </div>
            <div style={{ color: textSub, fontSize: 12, marginBottom: 8 }}>
              Get your API key from <a href={modalApp.url} target="_blank" rel="noreferrer" style={{ color: text }}>{modalApp.name} dashboard</a>
            </div>
            <input
              value={apiKeyValue}
              onChange={e => setApiKeyValue(e.target.value)}
              placeholder="Paste your API key here..."
              type="password"
              style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', border: `0.5px solid ${border}`, borderRadius: 8, color: text, fontSize: 13, marginBottom: 16, outline: 'none', padding: '10px 12px', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setApiKeyModal(null)} disabled={savingKey}
                style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 13, padding: '8px 16px' }}>
                Cancel
              </button>
              <button onClick={() => void handleSaveApiKey()} disabled={!apiKeyValue.trim() || savingKey}
                style={{ background: apiKeyValue.trim() && !savingKey ? text : textTertiary, border: 'none', borderRadius: 8, color: bg, cursor: apiKeyValue.trim() && !savingKey ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 500, padding: '8px 16px' }}>
                {savingKey ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ConnectPage.displayName = 'ConnectPage';
export default ConnectPage;
