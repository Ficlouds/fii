'use client';

import { memo, useState } from 'react';
import { Search, X, Check, Key } from 'lucide-react';
import { useIsDark } from '@/hooks/useIsDark';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { signIn } from '@/libs/better-auth/auth-client';

const MCP_APPS = [
  { id: 'higgsfield', name: 'Higgsfield', desc: 'AI video generation — Sora, Veo3, Kling, 30+ models', category: 'Creative', url: 'https://mcp.higgsfield.ai/mcp', logo: 'higgsfield.ai', auth: 'oauth' },
  { id: 'canva', name: 'Canva', desc: 'Create designs, presentations and visual content', category: 'Creative', url: 'https://mcp.canva.com/mcp', logo: 'canva.com', auth: 'oauth' },
  { id: 'figma', name: 'Figma', desc: 'Design files, components and prototypes', category: 'Creative', url: 'https://mcp.figma.com/mcp', logo: 'figma.com', auth: 'oauth' },
  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'AI voice generation and text to speech', category: 'Creative', url: 'https://elevenlabs.io', logo: 'elevenlabs.io', auth: 'apikey' },
  { id: 'runway', name: 'Runway', desc: 'AI video and image generation tools', category: 'Creative', url: 'https://runwayml.com', logo: 'runwayml.com', auth: 'apikey' },
  { id: 'stability', name: 'Stability AI', desc: 'Image generation with Stable Diffusion models', category: 'Creative', url: 'https://stability.ai', logo: 'stability.ai', auth: 'apikey' },
  { id: 'replicate', name: 'Replicate', desc: 'Run AI models in the cloud', category: 'Creative', url: 'https://replicate.com', logo: 'replicate.com', auth: 'apikey' },
  { id: 'huggingface', name: 'Hugging Face', desc: 'Open source AI models and datasets', category: 'Creative', url: 'https://huggingface.co', logo: 'huggingface.co', auth: 'apikey' },
  { id: 'midjourney', name: 'Midjourney', desc: 'AI image generation platform', category: 'Creative', url: 'https://midjourney.com', logo: 'midjourney.com', auth: 'apikey' },
  { id: 'adobe', name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere and more', category: 'Creative', url: 'https://adobe.com', logo: 'adobe.com', auth: 'apikey' },
  { id: 'slack', name: 'Slack', desc: 'Send messages, search conversations, manage channels', category: 'Communication', url: 'https://mcp.slack.com/mcp', logo: 'slack.com', auth: 'oauth' },
  { id: 'discord', name: 'Discord', desc: 'Messaging, servers and community management', category: 'Communication', url: 'https://discord.com', logo: 'discord.com', auth: 'apikey' },
  { id: 'telegram', name: 'Telegram', desc: 'Messaging and bot automation', category: 'Communication', url: 'https://telegram.org', logo: 'telegram.org', auth: 'apikey' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Business messaging and customer engagement', category: 'Communication', url: 'https://business.whatsapp.com', logo: 'whatsapp.com', auth: 'apikey' },
  { id: 'zoom', name: 'Zoom', desc: 'Video meetings, webinars and collaboration', category: 'Communication', url: 'https://zoom.us', logo: 'zoom.us', auth: 'apikey' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS, voice calls and communication APIs', category: 'Communication', url: 'https://twilio.com', logo: 'twilio.com', auth: 'apikey' },
  { id: 'notion', name: 'Notion', desc: 'Read and write pages, databases and workspaces', category: 'Productivity', url: 'https://mcp.notion.com/mcp', logo: 'notion.so', auth: 'oauth' },
  { id: 'asana', name: 'Asana', desc: 'Projects, tasks and team workflow management', category: 'Productivity', url: 'https://mcp.asana.com/mcp', logo: 'asana.com', auth: 'oauth' },
  { id: 'linear', name: 'Linear', desc: 'Issues, projects, cycles and team management', category: 'Productivity', url: 'https://mcp.linear.app/mcp', logo: 'linear.app', auth: 'oauth' },
  { id: 'monday', name: 'Monday.com', desc: 'Boards, items and project tracking', category: 'Productivity', url: 'https://mcp.monday.com/mcp', logo: 'monday.com', auth: 'oauth' },
  { id: 'clickup', name: 'ClickUp', desc: 'Tasks, docs and project collaboration', category: 'Productivity', url: 'https://clickup.com', logo: 'clickup.com', auth: 'apikey' },
  { id: 'box', name: 'Box', desc: 'Enterprise file storage, metadata and sharing', category: 'Productivity', url: 'https://mcp.box.com/mcp', logo: 'box.com', auth: 'oauth' },
  { id: 'dropbox', name: 'Dropbox', desc: 'Cloud file storage and collaboration', category: 'Productivity', url: 'https://dropbox.com', logo: 'dropbox.com', auth: 'apikey' },
  { id: 'airtable', name: 'Airtable', desc: 'Database, spreadsheet and workflow platform', category: 'Productivity', url: 'https://airtable.com', logo: 'airtable.com', auth: 'apikey' },
  { id: 'trello', name: 'Trello', desc: 'Visual project management with boards and cards', category: 'Productivity', url: 'https://trello.com', logo: 'trello.com', auth: 'apikey' },
  { id: 'todoist', name: 'Todoist', desc: 'Task management and productivity app', category: 'Productivity', url: 'https://todoist.com', logo: 'todoist.com', auth: 'apikey' },
  { id: 'evernote', name: 'Evernote', desc: 'Note taking and knowledge management', category: 'Productivity', url: 'https://evernote.com', logo: 'evernote.com', auth: 'apikey' },
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM contacts, deals and marketing pipelines', category: 'CRM', url: 'https://mcp.hubspot.com', logo: 'hubspot.com', auth: 'oauth' },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM leads, opportunities and contacts', category: 'CRM', url: 'https://mcp.salesforce.com/mcp', logo: 'salesforce.com', auth: 'oauth' },
  { id: 'clay', name: 'Clay', desc: 'Data enrichment, lead lists and CRM sync', category: 'CRM', url: 'https://mcp.clay.com/mcp', logo: 'clay.run', auth: 'oauth' },
  { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets and interactions', category: 'CRM', url: 'https://zendesk.com', logo: 'zendesk.com', auth: 'apikey' },
  { id: 'intercom', name: 'Intercom', desc: 'Customer messaging and support platform', category: 'CRM', url: 'https://intercom.com', logo: 'intercom.com', auth: 'apikey' },
  { id: 'pipedrive', name: 'Pipedrive', desc: 'Sales CRM and pipeline management', category: 'CRM', url: 'https://pipedrive.com', logo: 'pipedrive.com', auth: 'apikey' },
  { id: 'freshdesk', name: 'Freshdesk', desc: 'Customer support and helpdesk platform', category: 'CRM', url: 'https://freshdesk.com', logo: 'freshdesk.com', auth: 'apikey' },
  { id: 'github', name: 'GitHub', desc: 'Repositories, issues, PRs and workflows', category: 'Developer', url: 'https://api.githubcopilot.com/mcp/', logo: 'github.com', auth: 'oauth' },
  { id: 'gitlab', name: 'GitLab', desc: 'Repository, CI/CD and DevOps platform', category: 'Developer', url: 'https://gitlab.com', logo: 'gitlab.com', auth: 'apikey' },
  { id: 'vercel', name: 'Vercel', desc: 'Deployments, logs and environments', category: 'Developer', url: 'https://mcp.vercel.com', logo: 'vercel.com', auth: 'oauth' },
  { id: 'sentry', name: 'Sentry', desc: 'Error tracking, issues and performance', category: 'Developer', url: 'https://mcp.sentry.dev/mcp', logo: 'sentry.io', auth: 'oauth' },
  { id: 'supabase', name: 'Supabase', desc: 'Database, auth, storage and realtime', category: 'Developer', url: 'https://mcp.supabase.com/mcp', logo: 'supabase.com', auth: 'oauth' },
  { id: 'cloudflare', name: 'Cloudflare', desc: 'Workers, KV storage and DNS management', category: 'Developer', url: 'https://mcp.cloudflare.com/mcp', logo: 'cloudflare.com', auth: 'oauth' },
  { id: 'neon', name: 'Neon', desc: 'Serverless Postgres with branching', category: 'Developer', url: 'https://mcp.neon.tech/mcp', logo: 'neon.tech', auth: 'oauth' },
  { id: 'atlassian', name: 'Jira & Confluence', desc: 'Issues, tickets and team documentation', category: 'Developer', url: 'https://mcp.atlassian.com/v1/mcp', logo: 'atlassian.com', auth: 'oauth' },
  { id: 'postman', name: 'Postman', desc: 'API development and testing platform', category: 'Developer', url: 'https://postman.com', logo: 'postman.com', auth: 'apikey' },
  { id: 'aws', name: 'AWS', desc: 'Cloud infrastructure and services', category: 'Developer', url: 'https://aws.amazon.com', logo: 'aws.amazon.com', auth: 'apikey' },
  { id: 'firebase', name: 'Firebase', desc: 'App development platform by Google', category: 'Developer', url: 'https://firebase.google.com', logo: 'firebase.google.com', auth: 'apikey' },
  { id: 'mongodb', name: 'MongoDB', desc: 'NoSQL database platform', category: 'Developer', url: 'https://mongodb.com', logo: 'mongodb.com', auth: 'apikey' },
  { id: 'render', name: 'Render', desc: 'Cloud hosting for apps and databases', category: 'Developer', url: 'https://render.com', logo: 'render.com', auth: 'apikey' },
  { id: 'netlify', name: 'Netlify', desc: 'Web deployment and serverless platform', category: 'Developer', url: 'https://netlify.com', logo: 'netlify.com', auth: 'apikey' },
  { id: 'stripe', name: 'Stripe', desc: 'Payments, subscriptions and invoices', category: 'Finance', url: 'https://mcp.stripe.com', logo: 'stripe.com', auth: 'oauth' },
  { id: 'paypal', name: 'PayPal', desc: 'Payments, invoices and transactions', category: 'Finance', url: 'https://mcp.paypal.com/http', logo: 'paypal.com', auth: 'oauth' },
  { id: 'cashfree', name: 'Cashfree', desc: 'Payment gateway and payouts (India)', category: 'Finance', url: 'https://mcp.cashfree.com/mcp', logo: 'cashfree.com', auth: 'oauth' },
  { id: 'razorpay', name: 'Razorpay', desc: 'Payment gateway for India', category: 'Finance', url: 'https://razorpay.com', logo: 'razorpay.com', auth: 'apikey' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting and financial management', category: 'Finance', url: 'https://quickbooks.intuit.com', logo: 'quickbooks.intuit.com', auth: 'apikey' },
  { id: 'xero', name: 'Xero', desc: 'Cloud accounting software', category: 'Finance', url: 'https://xero.com', logo: 'xero.com', auth: 'apikey' },
  { id: 'brex', name: 'Brex', desc: 'Business banking and spend management', category: 'Finance', url: 'https://brex.com', logo: 'brex.com', auth: 'apikey' },
  { id: 'amplitude', name: 'Amplitude', desc: 'Product analytics, user journeys and A/B testing', category: 'Analytics', url: 'https://mcp.amplitude.com/mcp', logo: 'amplitude.com', auth: 'oauth' },
  { id: 'hex', name: 'Hex', desc: 'Data notebooks, analytics and interactive charts', category: 'Analytics', url: 'https://mcp.hex.tech/mcp', logo: 'hex.tech', auth: 'oauth' },
  { id: 'mixpanel', name: 'Mixpanel', desc: 'Product analytics and user behaviour', category: 'Analytics', url: 'https://mixpanel.com', logo: 'mixpanel.com', auth: 'apikey' },
  { id: 'googleanalytics', name: 'Google Analytics', desc: 'Web analytics and traffic reporting', category: 'Analytics', url: 'https://analytics.google.com', logo: 'analytics.google.com', auth: 'apikey' },
  { id: 'googleads', name: 'Google Ads', desc: 'Manage and optimize ad campaigns', category: 'Analytics', url: 'https://ads.google.com', logo: 'ads.google.com', auth: 'apikey' },
  { id: 'segment', name: 'Segment', desc: 'Customer data platform and analytics', category: 'Analytics', url: 'https://segment.com', logo: 'segment.com', auth: 'apikey' },
  { id: 'datadog', name: 'Datadog', desc: 'Monitoring, logs and infrastructure analytics', category: 'Analytics', url: 'https://datadoghq.com', logo: 'datadoghq.com', auth: 'apikey' },
  { id: 'hotjar', name: 'Hotjar', desc: 'Heatmaps, session recordings and feedback', category: 'Analytics', url: 'https://hotjar.com', logo: 'hotjar.com', auth: 'apikey' },
  { id: 'gmail', name: 'Gmail', desc: 'Read, compose and manage your emails', category: 'Google', url: 'https://gmailmcp.googleapis.com/mcp/v1', logo: 'gmail.com', auth: 'google' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Search, read and upload files', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'drive.google.com', auth: 'google' },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Manage events and schedule meetings', category: 'Google', url: 'https://calendarmcp.googleapis.com/mcp/v1', logo: 'calendar.google.com', auth: 'google' },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets, data and automation', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'sheets.google.com', auth: 'google' },
  { id: 'gdocs', name: 'Google Docs', desc: 'Documents and collaborative writing', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'docs.google.com', auth: 'google' },
  { id: 'gslides', name: 'Google Slides', desc: 'Presentations and slideshows', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'slides.google.com', auth: 'google' },
  { id: 'gforms', name: 'Google Forms', desc: 'Create forms and collect responses', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'forms.google.com', auth: 'google' },
  { id: 'gmeet', name: 'Google Meet', desc: 'Video meetings and calls', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'meet.google.com', auth: 'google' },
  { id: 'gchat', name: 'Google Chat', desc: 'Team messaging and collaboration', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'chat.google.com', auth: 'google' },
  { id: 'gtasks', name: 'Google Tasks', desc: 'Task lists and to-dos', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: 'tasks.google.com', auth: 'google' },
  { id: 'youtube', name: 'YouTube', desc: 'Video search, analytics and channel management', category: 'Google', url: 'https://youtube.com', logo: 'youtube.com', auth: 'apikey' },
  { id: 'youtubeanalytics', name: 'YouTube Analytics', desc: 'Channel performance and video analytics', category: 'Google', url: 'https://youtube.com', logo: 'youtube.com', auth: 'apikey' },
  { id: 'googlebigquery', name: 'Google BigQuery', desc: 'Serverless data warehouse and analytics', category: 'Google', url: 'https://cloud.google.com/bigquery', logo: 'cloud.google.com', auth: 'apikey' },
  { id: 'looker', name: 'Looker Studio', desc: 'Business intelligence and data visualization', category: 'Google', url: 'https://lookerstudio.google.com', logo: 'lookerstudio.google.com', auth: 'apikey' },
  { id: 'outlook', name: 'Outlook', desc: 'Email, calendar and contacts', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'outlook.com', auth: 'microsoft' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Cloud file storage and sharing', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'onedrive.live.com', auth: 'microsoft' },
  { id: 'teams', name: 'Microsoft Teams', desc: 'Team messaging, calls and collaboration', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'teams.microsoft.com', auth: 'microsoft' },
  { id: 'excel', name: 'Microsoft Excel', desc: 'Spreadsheets and data analysis', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'office.com', auth: 'microsoft' },
  { id: 'word', name: 'Microsoft Word', desc: 'Documents and word processing', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'office.com', auth: 'microsoft' },
  { id: 'powerpoint', name: 'PowerPoint', desc: 'Presentations and slideshows', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'office.com', auth: 'microsoft' },
  { id: 'sharepoint', name: 'SharePoint', desc: 'Team sites and document management', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'sharepoint.com', auth: 'microsoft' },
  { id: 'onenote', name: 'OneNote', desc: 'Digital notebooks and note taking', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'onenote.com', auth: 'microsoft' },
  { id: 'mstodo', name: 'Microsoft To Do', desc: 'Task lists and reminders', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'todo.microsoft.com', auth: 'microsoft' },
  { id: 'msplanner', name: 'Microsoft Planner', desc: 'Visual task and project planning', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: 'office.com', auth: 'microsoft' },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Post, search and manage tweets', category: 'Social', url: 'https://x.com', logo: 'x.com', auth: 'apikey' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional network and content', category: 'Social', url: 'https://linkedin.com', logo: 'linkedin.com', auth: 'apikey' },
  { id: 'wordpress', name: 'WordPress', desc: 'CMS, blog and website management', category: 'Social', url: 'https://wordpress.com', logo: 'wordpress.com', auth: 'apikey' },
  { id: 'instagram', name: 'Instagram', desc: 'Photo and video sharing platform', category: 'Social', url: 'https://instagram.com', logo: 'instagram.com', auth: 'apikey' },
  { id: 'facebook', name: 'Facebook', desc: 'Social media and advertising platform', category: 'Social', url: 'https://facebook.com', logo: 'facebook.com', auth: 'apikey' },
  { id: 'tiktok', name: 'TikTok', desc: 'Short video content and analytics', category: 'Social', url: 'https://tiktok.com', logo: 'tiktok.com', auth: 'apikey' },
  { id: 'pinterest', name: 'Pinterest', desc: 'Visual discovery and inspiration platform', category: 'Social', url: 'https://pinterest.com', logo: 'pinterest.com', auth: 'apikey' },
  { id: 'reddit', name: 'Reddit', desc: 'Community discussions and content', category: 'Social', url: 'https://reddit.com', logo: 'reddit.com', auth: 'apikey' },
  { id: 'shopify', name: 'Shopify', desc: 'E-commerce store management', category: 'E-commerce', url: 'https://shopify.com', logo: 'shopify.com', auth: 'apikey' },
  { id: 'woocommerce', name: 'WooCommerce', desc: 'WordPress e-commerce platform', category: 'E-commerce', url: 'https://woocommerce.com', logo: 'woocommerce.com', auth: 'apikey' },
  { id: 'amazon', name: 'Amazon Seller', desc: 'Amazon marketplace seller tools', category: 'E-commerce', url: 'https://sellercentral.amazon.com', logo: 'amazon.com', auth: 'apikey' },
  { id: 'flipkart', name: 'Flipkart Seller', desc: 'Flipkart marketplace seller tools', category: 'E-commerce', url: 'https://seller.flipkart.com', logo: 'flipkart.com', auth: 'apikey' },
  { id: 'meesho', name: 'Meesho', desc: 'Indian social commerce platform', category: 'E-commerce', url: 'https://meesho.com', logo: 'meesho.com', auth: 'apikey' },
  { id: 'wix', name: 'Wix', desc: 'Website builder and e-commerce platform', category: 'E-commerce', url: 'https://wix.com', logo: 'wix.com', auth: 'apikey' },
];

const CATEGORIES = ['All', 'Creative', 'Communication', 'Productivity', 'CRM', 'Developer', 'Finance', 'Analytics', 'Google', 'Microsoft', 'Social', 'E-commerce'];

const AppIcon = ({ logo, name }: { logo: string; name: string }) => {
  const isDark = useIsDark();
  return (
    <div style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 8, display: 'flex', flexShrink: 0, height: 36, justifyContent: 'center', overflow: 'hidden', width: 36 }}>
      <img src={`https://www.google.com/s2/favicons?domain=${logo}&sz=64`} alt={name} style={{ height: 22, objectFit: 'contain', width: 22 }}
        onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; if (el.parentElement) el.parentElement.innerHTML = `<span style="font-size:11px;font-weight:500;color:var(--color-text-tertiary)">${name.slice(0,2).toUpperCase()}</span>`; }} />
    </div>
  );
};

const ConnectPage = memo(() => {
  const isDark = useIsDark();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [apiKeyModal, setApiKeyModal] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [manualConnected, setManualConnected] = useState<string[]>([]);
  const installCustomPlugin = useToolStore((s) => s.installCustomPlugin);
  const uninstallCustomPlugin = useToolStore((s) => s.uninstallCustomPlugin);
  const installedPlugins = useToolStore(pluginSelectors.storeAndInstallPluginsIdList);
  const connected = [...new Set([...manualConnected, ...MCP_APPS.filter(a => installedPlugins.includes(a.id)).map(a => a.id)])];
  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
  const filtered = MCP_APPS.filter(app => {
    const matchSearch = !search.trim() || app.name.toLowerCase().includes(search.toLowerCase()) || app.desc.toLowerCase().includes(search.toLowerCase()) || app.category.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (activeCategory === 'All' || app.category === activeCategory);
  });
  const connectedApps = MCP_APPS.filter(a => connected.includes(a.id));
  const unconnectedFiltered = filtered.filter(a => !connected.includes(a.id));
  const groupedByCategory: Record<string, typeof MCP_APPS> = {};
  unconnectedFiltered.forEach(app => { if (!groupedByCategory[app.category]) groupedByCategory[app.category] = []; groupedByCategory[app.category].push(app); });
  const handleConnect = async (app: typeof MCP_APPS[0]) => {
    if (app.auth === 'apikey') { setApiKeyModal(app.id); setApiKeyValue(''); return; }
    if (app.auth === 'google') {
      try { await (signIn as any).social({ callbackURL: '/connect', provider: 'google' }); } catch { window.location.href = '/signin?callbackUrl=/connect'; }
      return;
    }
    if (app.auth === 'microsoft') {
      try { await (signIn as any).social({ callbackURL: '/connect', provider: 'microsoft' }); } catch { window.location.href = '/signin?callbackUrl=/connect'; }
      return;
    }
    setConnecting(app.id);
    try {
      await installCustomPlugin({ customParams: { avatar: `https://www.google.com/s2/favicons?domain=${app.logo}&sz=64`, description: app.desc, mcp: { type: 'http', url: app.url } }, identifier: app.id, type: 'customPlugin' });
      setManualConnected(prev => [...prev, app.id]);
    } catch { window.open(app.url, '_blank'); } finally { setConnecting(null); }
  };
  const handleDisconnect = async (id: string) => { try { await uninstallCustomPlugin(id); } catch {} setManualConnected(prev => prev.filter(x => x !== id)); };
  const handleSaveApiKey = async () => {
    if (apiKeyModal && apiKeyValue.trim()) {
      const app = MCP_APPS.find(a => a.id === apiKeyModal);
      if (app) { setConnecting(apiKeyModal); try { await installCustomPlugin({ customParams: { avatar: `https://www.google.com/s2/favicons?domain=${app.logo}&sz=64`, description: app.desc, mcp: { type: 'http', url: app.url, auth: { type: 'bearer', token: apiKeyValue.trim() } } }, identifier: app.id, type: 'customPlugin' }); setManualConnected(prev => [...prev, apiKeyModal]); } catch { setManualConnected(prev => [...prev, apiKeyModal]); } finally { setConnecting(null); } }
      setApiKeyModal(null); setApiKeyValue('');
    }
  };
  const modalApp = MCP_APPS.find(a => a.id === apiKeyModal);
  return (
    <div style={{ background: bg, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ background: isDark ? '#1e1e1d' : '#ffffff', borderBottom: `0.5px solid ${border}`, flexShrink: 0, padding: '20px 32px 16px' }}>
        <div style={{ alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: text, fontSize: 20, fontWeight: 500, margin: 0 }}>Connect</h1>
            <p style={{ color: textSub, fontSize: 13, margin: '4px 0 0' }}>Connect Fi to your apps and services. OAuth apps connect with a single login — no API keys needed.</p>
          </div>
          <div style={{ color: textTertiary, fontSize: 12 }}>{MCP_APPS.length}+ integrations</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
          <div style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 10, display: 'flex', gap: 8, padding: '7px 12px', width: 280, flexShrink: 0 }}>
            <Search size={14} style={{ color: textTertiary, flexShrink: 0 }} />
            <input placeholder="Search connectors..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 13, outline: 'none' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: textTertiary, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={13} /></button>}
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: activeCategory === cat ? text : 'transparent', border: `0.5px solid ${activeCategory === cat ? 'transparent' : border}`, borderRadius: 20, color: activeCategory === cat ? bg : textSub, cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 14px', transition: 'all 0.15s' }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px 40px' }}>
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
                    <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}><span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span><Check size={12} style={{ color: isDark ? '#4ade80' : '#16a34a' }} /></div>
                    <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  </div>
                  <button onClick={() => handleDisconnect(app.id)} style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap' }}>Disconnect</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {Object.entries(groupedByCategory).map(([category, apps]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>{category}</div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {apps.map(app => (
                <div key={app.id} style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, cursor: 'pointer', display: 'flex', gap: 12, padding: '12px 14px', transition: 'border-color 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = border}
                  onClick={() => handleConnect(app)}>
                  <AppIcon logo={app.logo} name={app.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                      <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                      {app.auth === 'apikey' && <span style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `0.5px solid ${border}`, borderRadius: 6, color: textTertiary, display: 'flex', fontSize: 10, gap: 3, padding: '1px 6px' }}><Key size={9} /> API key</span>}
                    </div>
                    <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  </div>
                  <button disabled={connecting === app.id} style={{ background: connecting === app.id ? textTertiary : text, border: 'none', borderRadius: 8, color: bg, cursor: connecting === app.id ? 'not-allowed' : 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 500, padding: '5px 12px', whiteSpace: 'nowrap' }}>
                    {connecting === app.id ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: textSub, fontSize: 13, padding: '60px 0', textAlign: 'center' }}>No connectors found for &ldquo;{search}&rdquo;</div>}
      </div>
      {apiKeyModal && modalApp && (
        <div style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 }}>
          <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 16, padding: '24px', width: 420 }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 20 }}>
              <AppIcon logo={modalApp.logo} name={modalApp.name} />
              <div><div style={{ color: text, fontSize: 15, fontWeight: 500 }}>Connect {modalApp.name}</div><div style={{ color: textSub, fontSize: 12, marginTop: 2 }}>Enter your API key to connect</div></div>
            </div>
            <div style={{ color: textSub, fontSize: 12, marginBottom: 8 }}>Get your API key from <a href={modalApp.url} target="_blank" rel="noreferrer" style={{ color: text }}>{modalApp.name} dashboard</a></div>
            <input value={apiKeyValue} onChange={e => setApiKeyValue(e.target.value)} placeholder="Paste your API key here..." type="password" style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', border: `0.5px solid ${border}`, borderRadius: 8, color: text, fontSize: 13, marginBottom: 16, outline: 'none', padding: '10px 12px', width: '100%' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setApiKeyModal(null)} style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 13, padding: '8px 16px' }}>Cancel</button>
              <button onClick={handleSaveApiKey} disabled={!apiKeyValue.trim()} style={{ background: apiKeyValue.trim() ? text : textTertiary, border: 'none', borderRadius: 8, color: bg, cursor: apiKeyValue.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 500, padding: '8px 16px' }}>Connect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ConnectPage.displayName = 'ConnectPage';
export default ConnectPage;
