'use client';

import { Check, Key, Search, X } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useIsDark } from '@/hooks/useIsDark';
import { useToolStore } from '@/store/tool';

const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const BROWSE_NAME_MAP: Record<string, string> = {
  acculynx: 'AccuLynx', adp_workforce: 'ADP Workforce', agencyzoom: 'AgencyZoom',
  bamboohr: 'BambooHR', borneo: 'Borneo', browser_tool: 'Browser Tool',
  browserbase_tool: 'Browserbase', clickup: 'ClickUp', codeinterpreter: 'Code Interpreter',
  docusign: 'DocuSign', hubspot: 'HubSpot',
  composio_search: 'Composio Search', discordbot: 'Discord Bot', google_maps: 'Google Maps',
  googleanalytics: 'Google Analytics', googlebigquery: 'BigQuery', googlecalendar: 'Google Calendar',
  googledocs: 'Google Docs', googledrive: 'Google Drive', googlemeet: 'Google Meet',
  googlephotos: 'Google Photos', googlesheets: 'Google Sheets', googlesuper: 'Google Super',
  googletasks: 'Google Tasks', heygen: 'HeyGen', junglescout: 'Amazon',
  linkup: 'LinkUp', listennotes: 'Listen Notes', lmnt: 'LMNT',
  metaads: 'Meta Ads', microsoft_clarity: 'Microsoft Clarity', microsoft_teams: 'Microsoft Teams',
  one_drive: 'OneDrive', peopledatalabs: 'People Data Labs', posthog: 'PostHog',
  quickbooks: 'QuickBooks', rippling_hr: 'Rippling HR', semanticscholar: 'Semantic Scholar',
  sendgrid: 'SendGrid', slackbot: 'Slack Bot', text_to_pdf: 'Text to PDF',
  weathermap: 'Weather Map', yousearch: 'YouSearch', zenrows: 'ZenRows',
};

const formatAppName = (slug: string): string =>
  BROWSE_NAME_MAP[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).replaceAll('_', ' ');

const BROWSE_DOMAIN_MAP: Record<string, string> = {
  acculynx: 'acculynx.com', adp_workforce: 'adp.com', agencyzoom: 'agencyzoom.com',
  borneo: 'borneo.io', browserbase_tool: 'browserbase.com', canva: 'canva.com', canvas: 'canva.com',
  codeinterpreter: 'code.visualstudio.com', composio_search: 'composio.dev',
  discordbot: 'discord.com', google_maps: 'maps.google.com', googleanalytics: 'analytics.google.com',
  googlebigquery: 'cloud.google.com', googlecalendar: 'calendar.google.com', googledocs: 'docs.google.com',
  googledrive: 'drive.google.com', googlemeet: 'meet.google.com', googlephotos: 'photos.google.com',
  googlesheets: 'sheets.google.com', googletasks: 'tasks.google.com', junglescout: 'junglescout.com',
  linkup: 'linkup.so', listennotes: 'listennotes.com', lmnt: 'lmnt.com', metaads: 'facebook.com',
  microsoft_clarity: 'clarity.microsoft.com', microsoft_teams: 'teams.microsoft.com',
  one_drive: 'onedrive.com', peopledatalabs: 'peopledatalabs.com', rippling_hr: 'rippling.com',
  semanticscholar: 'semanticscholar.org', slackbot: 'slack.com', weathermap: 'openweathermap.org',
  yousearch: 'you.com', zenrows: 'zenrows.com',
};

const slugToDomain = (slug: string): string => BROWSE_DOMAIN_MAP[slug] || `${slug.replaceAll('_', '')}.com`;

const LOGO_MAP: Record<string, string> = {
  airtable: 'https://airtable.com/favicon.ico',
  amazon: 'https://www.amazon.com/favicon.ico',
  amplitude: 'https://amplitude.com/favicon.ico',
  apollo: 'https://www.apollo.io/favicon.ico',
  asana: 'https://asana.com/favicon.ico',
  atlassian: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png',
  attio: 'https://attio.com/favicon.ico',
  aws: 'https://aws.amazon.com/favicon.ico',
  bamboohr: 'https://www.bamboohr.com/favicon.ico',
  box: 'https://www.box.com/favicon.ico',
  brevo: 'https://www.brevo.com/favicon.ico',
  brex: 'https://www.brex.com/favicon.ico',
  calendly: 'https://calendly.com/favicon.ico',
  canva: 'https://www.canva.com/favicon.ico',
  cashfree: 'https://www.cashfree.com/favicon.ico',
  clay: 'https://clay.com/favicon.ico',
  clickup: 'https://clickup.com/favicon.ico',
  cloudflare: 'https://www.cloudflare.com/favicon.ico',
  coinbase: 'https://www.coinbase.com/favicon.ico',
  datadog: 'https://www.datadoghq.com/favicon.ico',
  discord: 'https://discord.com/assets/favicon.ico',
  docusign: 'https://www.docusign.com/favicon.ico',
  dropbox: 'https://cfl.dropboxstatic.com/static/images/favicon-vfl8lUR9B.ico',
  dynamics365: 'https://www.microsoft.com/favicon.ico',
  elevenlabs: 'https://elevenlabs.io/favicon.ico',
  evernote: 'https://evernote.com/favicon.ico',
  excel: 'https://res.cdn.office.net/assets/excel/pwa/images/microsoft_excel_icon_128.png',
  figma: 'https://static.figma.com/app/icon/1/favicon.ico',
  fireflies: 'https://fireflies.ai/favicon.ico',
  flipkart: 'https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-icons/app-icons/favicon-32x32.png',
  freshdesk: 'https://freshdesk.com/favicon.ico',
  gcalendar: 'https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png',
  gchat: 'https://ssl.gstatic.com/chat/favicon/favicon_96dp.png',
  gdocs: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
  gdrive: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',
  gforms: 'https://ssl.gstatic.com/docs/spreadsheets/forms/favicon_qp2.png',
  github: 'https://github.com/favicon.ico',
  gitlab: 'https://gitlab.com/favicon.ico',
  gmail: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  gmeet: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png',
  googleads: 'https://www.gstatic.com/images/branding/product/2x/google_ads_48dp.png',
  googleanalytics: 'https://ssl.gstatic.com/analytics/20230726/favicon_analytics_v2_192px.png',
  googlebigquery: 'https://ssl.gstatic.com/pantheon/images/bigquery/favicon.ico',
  gsheets: 'https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico',
  gslides: 'https://ssl.gstatic.com/docs/presentations/images/favicon5.ico',
  gtasks: 'https://ssl.gstatic.com/images/branding/product/2x/tasks_2020q4_48dp.png',
  heygen: 'https://www.heygen.com/favicon.ico',
  hex: 'https://hex.tech/favicon.ico',
  higgsfield: 'https://higgsfield.ai/favicon.ico',
  hubspot: 'https://www.hubspot.com/favicon.ico',
  instagram: 'https://www.instagram.com/favicon.ico',
  intercom: 'https://www.intercom.com/favicon.ico',
  klaviyo: 'https://www.klaviyo.com/favicon.ico',
  linear: 'https://linear.app/favicon.ico',
  linkedin: 'https://www.linkedin.com/favicon.ico',
  looker: 'https://www.gstatic.com/images/branding/product/2x/looker_48dp.png',
  mailchimp: 'https://mailchimp.com/favicon.ico',
  midjourney: 'https://www.midjourney.com/favicon.ico',
  mixpanel: 'https://mixpanel.com/favicon.ico',
  monday: 'https://monday.com/favicon.ico',
  mstodo: 'https://to-do.microsoft.com/favicon.ico',
  msplanner: 'https://res.cdn.office.net/assets/planner/planner-favicon.ico',
  notion: 'https://www.notion.so/images/favicon.ico',
  onedrive: 'https://res.cdn.office.net/assets/onedrive/webapp/6c.0.0/images/favicon.ico',
  onenote: 'https://res.cdn.office.net/assets/onenote/pwa/images/microsoft_onenote_icon_128.png',
  outlook: 'https://res.cdn.office.net/assets/mail/pwa/v1/logos/img_logo.png',
  pagerduty: 'https://www.pagerduty.com/favicon.ico',
  paypal: 'https://www.paypal.com/favicon.ico',
  pinterest: 'https://www.pinterest.com/favicon.ico',
  pipedrive: 'https://www.pipedrive.com/favicon.ico',
  plaid: 'https://plaid.com/favicon.ico',
  posthog: 'https://posthog.com/favicon.ico',
  postman: 'https://www.postman.com/favicon.ico',
  powerpoint: 'https://res.cdn.office.net/assets/powerpoint/pwa/images/microsoft_powerpoint_icon_128.png',
  quickbooks: 'https://quickbooks.intuit.com/favicon.ico',
  razorpay: 'https://razorpay.com/favicon.ico',
  reddit: 'https://www.reddit.com/favicon.ico',
  replicate: 'https://replicate.com/favicon.ico',
  runway: 'https://runwayml.com/favicon.ico',
  salesforce: 'https://www.salesforce.com/favicon.ico',
  segment: 'https://segment.com/favicon.ico',
  semrush: 'https://www.semrush.com/favicon.ico',
  sendgrid: 'https://sendgrid.com/favicon.ico',
  sentry: 'https://sentry.io/favicon.ico',
  sharepoint: 'https://res.cdn.office.net/assets/sharepoint/pwa/images/microsoft_sharepoint_icon_128.png',
  shopify: 'https://cdn.shopify.com/static/shopify-favicon.png',
  slack: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
  stripe: 'https://stripe.com/favicon.ico',
  supabase: 'https://supabase.com/favicon/favicon-32x32.png',
  teams: 'https://res.cdn.office.net/assets/team/windows/2020/microsoft-teams-icon.ico',
  telegram: 'https://telegram.org/favicon.ico',
  tiktok: 'https://www.tiktok.com/favicon.ico',
  todoist: 'https://todoist.com/favicon.ico',
  trello: 'https://trello.com/favicon.ico',
  twilio: 'https://www.twilio.com/favicon.ico',
  twitter: 'https://abs.twimg.com/favicons/twitter.3.ico',
  whatsapp: 'https://www.whatsapp.com/favicon.ico',
  woocommerce: 'https://woocommerce.com/favicon.ico',
  word: 'https://res.cdn.office.net/assets/word/pwa/images/microsoft_word_icon_128.png',
  wordpress: 'https://s.w.org/favicon.ico',
  xero: 'https://www.xero.com/favicon.ico',
  youtube: 'https://www.youtube.com/favicon.ico',
  youtubeanalytics: 'https://www.youtube.com/favicon.ico',
  zendesk: 'https://www.zendesk.com/favicon.ico',
  zoho: 'https://www.zoho.com/favicon.ico',
  zoom: 'https://zoom.us/favicon.ico',
};

// Maps Fi's internal app ids to Composio's app slugs - used to request the auth URL
// and to resolve connections returned by Composio back to our app entries
const COMPOSIO_APP_MAP: Record<string, string> = {
  airtable: 'airtable',
  amazon: 'junglescout',
  amplitude: 'amplitude',
  apollo: 'apollo',
  asana: 'asana',
  atlassian: 'jira',
  attio: 'attio',
  bamboohr: 'bamboohr',
  box: 'box',
  brevo: 'brevo',
  calendly: 'calendly',
  canva: 'canva',
  clickup: 'clickup',
  cloudflare: 'cloudflare',
  coinbase: 'coinbase',
  datadog: 'datadog',
  discord: 'discord',
  docusign: 'docusign',
  dropbox: 'dropbox',
  dynamics365: 'dynamics365',
  elevenlabs: 'elevenlabs',
  evernote: 'evernote',
  excel: 'microsoft_teams',
  facebook: 'facebook',
  figma: 'figma',
  fireflies: 'fireflies',
  freshdesk: 'freshdesk',
  gcalendar: 'googlecalendar',
  gchat: 'googlechat',
  gdocs: 'googledocs',
  gdrive: 'googledrive',
  gforms: 'googleforms',
  github: 'github',
  gitlab: 'gitlab',
  gmail: 'gmail',
  gmeet: 'googlemeet',
  googleads: 'googleads',
  googleanalytics: 'googleanalytics',
  googlebigquery: 'googlebigquery',
  googlemaps: 'google_maps',
  googlephotos: 'googlephotos',
  gsheets: 'googlesheets',
  gslides: 'googleslides',
  gtasks: 'googletasks',
  heygen: 'heygen',
  hubspot: 'hubspot',
  huggingface: 'huggingface',
  instagram: 'instagram',
  intercom: 'intercom',
  klaviyo: 'klaviyo',
  linear: 'linear',
  linkedin: 'linkedin',
  looker: 'looker',
  mailchimp: 'mailchimp',
  mixpanel: 'mixpanel',
  monday: 'monday',
  msplanner: 'microsoft_teams',
  mstodo: 'microsoft_teams',
  notion: 'notion',
  onedrive: 'one_drive',
  onenote: 'microsoft_teams',
  outlook: 'outlook',
  paypal: 'paypal',
  pinterest: 'pinterest',
  pipedrive: 'pipedrive',
  posthog: 'posthog',
  powerpoint: 'microsoft_teams',
  quickbooks: 'quickbooks',
  razorpay: 'razorpay',
  reddit: 'reddit',
  replicate: 'replicate',
  salesforce: 'salesforce',
  segment: 'segment',
  semrush: 'semrush',
  sendgrid: 'sendgrid',
  sentry: 'sentry',
  sharepoint: 'microsoft_teams',
  shopify: 'shopify',
  slack: 'slack',
  stripe: 'stripe',
  supabase: 'supabase',
  teams: 'microsoft_teams',
  tiktok: 'tiktok',
  todoist: 'todoist',
  trello: 'trello',
  twilio: 'twilio',
  twitter: 'twitter',
  whatsapp: 'whatsapp',
  woocommerce: 'woocommerce',
  word: 'microsoft_teams',
  wordpress: 'wordpress',
  xero: 'xero',
  youtube: 'youtube',
  youtubeanalytics: 'youtube',
  zendesk: 'zendesk',
  zoho: 'zoho',
};

type AppAuth = 'apikey' | 'coming_soon' | 'composio';

interface McpApp {
  auth: AppAuth;
  category: string;
  desc: string;
  id: string;
  logo: string;
  mcpUrl: string;
  name: string;
}

const MCP_APPS: McpApp[] = [
  // Creative
  { id: 'higgsfield', name: 'Higgsfield', desc: 'AI video generation - Sora, Veo3, Kling, 30+ models', category: 'Creative', mcpUrl: 'https://mcp.higgsfield.ai/mcp', logo: fav('higgsfield.ai'), auth: 'apikey' },
  { id: 'canva', name: 'Canva', desc: 'Create designs, presentations and visual content', category: 'Creative', mcpUrl: 'https://mcp.canva.com/mcp', logo: fav('canva.com'), auth: 'composio' },
  { id: 'figma', name: 'Figma', desc: 'Design files, components and prototypes', category: 'Creative', mcpUrl: 'https://mcp.figma.com/mcp', logo: fav('figma.com'), auth: 'composio' },
  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'AI voice generation and text to speech', category: 'Creative', mcpUrl: 'https://api.elevenlabs.io', logo: fav('elevenlabs.io'), auth: 'composio' },
  { id: 'runway', name: 'Runway', desc: 'AI video and image generation tools', category: 'Creative', mcpUrl: 'https://api.dev.runwayml.com', logo: fav('runwayml.com'), auth: 'apikey' },
  { id: 'adobe', name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere and more', category: 'Creative', mcpUrl: 'https://adobeioruntime.net', logo: fav('adobe.com'), auth: 'apikey' },
  // Communication
  { id: 'slack', name: 'Slack', desc: 'Send messages, search conversations, manage channels', category: 'Communication', mcpUrl: 'https://mcp.slack.com/mcp', logo: fav('slack.com'), auth: 'composio' },
  { id: 'discord', name: 'Discord', desc: 'Messaging, servers and community management', category: 'Communication', mcpUrl: 'https://discord.com/api', logo: fav('discord.com'), auth: 'composio' },
  { id: 'telegram', name: 'Telegram', desc: 'Messaging and bot automation', category: 'Communication', mcpUrl: 'https://api.telegram.org', logo: fav('telegram.org'), auth: 'composio' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Business messaging and customer engagement', category: 'Communication', mcpUrl: 'https://graph.facebook.com', logo: fav('business.whatsapp.com'), auth: 'composio' },
  { id: 'zoom', name: 'Zoom', desc: 'Video meetings, webinars and recordings', category: 'Communication', mcpUrl: 'https://api.zoom.us/v2', logo: fav('zoom.us'), auth: 'composio' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS, voice calls and messaging APIs', category: 'Communication', mcpUrl: 'https://api.twilio.com', logo: fav('twilio.com'), auth: 'composio' },
  // Productivity
  { id: 'notion', name: 'Notion', desc: 'Read and write pages, databases and workspaces', category: 'Productivity', mcpUrl: 'https://mcp.notion.com/mcp', logo: fav('notion.so'), auth: 'composio' },
  { id: 'asana', name: 'Asana', desc: 'Projects, tasks and team workflow management', category: 'Productivity', mcpUrl: 'https://mcp.asana.com/mcp', logo: fav('asana.com'), auth: 'composio' },
  { id: 'linear', name: 'Linear', desc: 'Issues, projects, cycles and team management', category: 'Productivity', mcpUrl: 'https://mcp.linear.app/mcp', logo: fav('linear.app'), auth: 'composio' },
  { id: 'monday', name: 'Monday.com', desc: 'Boards, items and project tracking', category: 'Productivity', mcpUrl: 'https://api.monday.com', logo: fav('monday.com'), auth: 'composio' },
  { id: 'clickup', name: 'ClickUp', desc: 'Tasks, docs and project collaboration', category: 'Productivity', mcpUrl: 'https://api.clickup.com', logo: fav('clickup.com'), auth: 'coming_soon' },
  { id: 'box', name: 'Box', desc: 'Enterprise file storage, metadata and sharing', category: 'Productivity', mcpUrl: 'https://mcp.box.com/mcp', logo: fav('box.com'), auth: 'composio' },
  { id: 'dropbox', name: 'Dropbox', desc: 'Cloud file storage and collaboration', category: 'Productivity', mcpUrl: 'https://api.dropbox.com', logo: fav('dropbox.com'), auth: 'composio' },
  { id: 'airtable', name: 'Airtable', desc: 'Database, spreadsheet and workflow platform', category: 'Productivity', mcpUrl: 'https://mcp.airtable.com/mcp', logo: fav('airtable.com'), auth: 'composio' },
  { id: 'todoist', name: 'Todoist', desc: 'Task management and to-do lists', category: 'Productivity', mcpUrl: 'https://api.todoist.com', logo: fav('todoist.com'), auth: 'composio' },
  { id: 'trello', name: 'Trello', desc: 'Visual boards and card-based task tracking', category: 'Productivity', mcpUrl: 'https://api.trello.com', logo: fav('trello.com'), auth: 'composio' },
  // CRM
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM contacts, deals and marketing pipelines', category: 'CRM', mcpUrl: 'https://mcp.hubspot.com', logo: fav('hubspot.com'), auth: 'composio' },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM leads, opportunities and contacts', category: 'CRM', mcpUrl: 'https://mcp.salesforce.com/mcp', logo: fav('salesforce.com'), auth: 'coming_soon' },
  { id: 'clay', name: 'Clay', desc: 'Data enrichment, lead lists and CRM sync', category: 'CRM', mcpUrl: 'https://api.clay.com', logo: fav('clay.com'), auth: 'composio' },
  { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets and interactions', category: 'CRM', mcpUrl: 'https://api.zendesk.com', logo: fav('zendesk.com'), auth: 'composio' },
  { id: 'intercom', name: 'Intercom', desc: 'Customer messaging and support platform', category: 'CRM', mcpUrl: 'https://mcp.intercom.com', logo: fav('intercom.com'), auth: 'composio' },
  { id: 'pipedrive', name: 'Pipedrive', desc: 'Sales pipeline and deal management', category: 'CRM', mcpUrl: 'https://api.pipedrive.com', logo: fav('pipedrive.com'), auth: 'composio' },
  // Developer
  { id: 'github', name: 'GitHub', desc: 'Repositories, issues, PRs and workflows', category: 'Developer', mcpUrl: 'https://api.githubcopilot.com/mcp/', logo: fav('github.com'), auth: 'composio' },
  { id: 'gitlab', name: 'GitLab', desc: 'Repository, CI/CD and DevOps platform', category: 'Developer', mcpUrl: 'https://gitlab.com', logo: fav('gitlab.com'), auth: 'composio' },
  { id: 'vercel', name: 'Vercel', desc: 'Deployments, logs and project environments', category: 'Developer', mcpUrl: 'https://mcp.vercel.com', logo: fav('vercel.com'), auth: 'coming_soon' },
  { id: 'sentry', name: 'Sentry', desc: 'Error tracking, issues and performance', category: 'Developer', mcpUrl: 'https://mcp.sentry.dev/mcp', logo: fav('sentry.io'), auth: 'composio' },
  { id: 'supabase', name: 'Supabase', desc: 'Database, auth, storage and realtime', category: 'Developer', mcpUrl: 'https://mcp.supabase.com/mcp', logo: fav('supabase.com'), auth: 'composio' },
  { id: 'cloudflare', name: 'Cloudflare', desc: 'Workers, KV storage and DNS management', category: 'Developer', mcpUrl: 'https://mcp.cloudflare.com/mcp', logo: fav('cloudflare.com'), auth: 'composio' },
  { id: 'neon', name: 'Neon', desc: 'Serverless Postgres with branching', category: 'Developer', mcpUrl: 'https://mcp.neon.tech/mcp', logo: fav('neon.tech'), auth: 'composio' },
  { id: 'atlassian', name: 'Jira & Confluence', desc: 'Issues, tickets and team documentation', category: 'Developer', mcpUrl: 'https://mcp.atlassian.com/v1/mcp', logo: fav('atlassian.com'), auth: 'composio' },
  { id: 'firebase', name: 'Firebase', desc: 'App backend, Firestore, Auth and hosting', category: 'Developer', mcpUrl: 'https://firebase.google.com', logo: fav('firebase.google.com'), auth: 'composio' },
  { id: 'postman', name: 'Postman', desc: 'API development and testing platform', category: 'Developer', mcpUrl: 'https://api.getpostman.com', logo: fav('postman.com'), auth: 'apikey' },
  { id: 'aws', name: 'AWS', desc: 'Cloud infrastructure and services', category: 'Developer', mcpUrl: 'https://aws.amazon.com', logo: fav('aws.amazon.com'), auth: 'composio' },
  { id: 'datadog', name: 'Datadog', desc: 'Monitoring, metrics and observability', category: 'Developer', mcpUrl: 'https://api.datadoghq.com', logo: fav('datadoghq.com'), auth: 'composio' },
  { id: 'pagerduty', name: 'PagerDuty', desc: 'Incident management and on-call alerting', category: 'Developer', mcpUrl: 'https://api.pagerduty.com', logo: fav('pagerduty.com'), auth: 'apikey' },
  // Finance
  { id: 'stripe', name: 'Stripe', desc: 'Payments, subscriptions and invoices', category: 'Finance', mcpUrl: 'https://mcp.stripe.com', logo: fav('stripe.com'), auth: 'composio' },
  { id: 'paypal', name: 'PayPal', desc: 'Payments, invoices and transactions', category: 'Finance', mcpUrl: 'https://mcp.paypal.com/http', logo: fav('paypal.com'), auth: 'composio' },
  { id: 'cashfree', name: 'Cashfree', desc: 'Payment gateway and payouts (India)', category: 'Finance', mcpUrl: 'https://api.cashfree.com', logo: fav('cashfree.com'), auth: 'apikey' },
  { id: 'razorpay', name: 'Razorpay', desc: 'Payment gateway for India', category: 'Finance', mcpUrl: 'https://api.razorpay.com', logo: fav('razorpay.com'), auth: 'composio' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting and financial management', category: 'Finance', mcpUrl: 'https://quickbooks.intuit.com', logo: fav('quickbooks.intuit.com'), auth: 'composio' },
  { id: 'xero', name: 'Xero', desc: 'Cloud accounting and bookkeeping', category: 'Finance', mcpUrl: 'https://api.xero.com', logo: fav('xero.com'), auth: 'composio' },
  { id: 'plaid', name: 'Plaid', desc: 'Bank account connections and financial data', category: 'Finance', mcpUrl: 'https://api.plaid.com', logo: fav('plaid.com'), auth: 'coming_soon' },
  { id: 'brex', name: 'Brex', desc: 'Business banking and spend management', category: 'Finance', mcpUrl: 'https://platform.brexapis.com', logo: fav('brex.com'), auth: 'apikey' },
  // Analytics
  { id: 'amplitude', name: 'Amplitude', desc: 'Product analytics, user journeys and A/B testing', category: 'Analytics', mcpUrl: 'https://mcp.amplitude.com/mcp', logo: fav('amplitude.com'), auth: 'composio' },
  { id: 'hex', name: 'Hex', desc: 'Data notebooks, analytics and interactive charts', category: 'Analytics', mcpUrl: 'https://mcp.hex.tech/mcp', logo: fav('hex.tech'), auth: 'composio' },
  { id: 'mixpanel', name: 'Mixpanel', desc: 'Product analytics and user behaviour', category: 'Analytics', mcpUrl: 'https://mixpanel.com', logo: fav('mixpanel.com'), auth: 'composio' },
  { id: 'segment', name: 'Segment', desc: 'Customer data platform and event tracking', category: 'Analytics', mcpUrl: 'https://segment.com', logo: fav('segment.com'), auth: 'composio' },
  { id: 'lookerbi', name: 'Looker', desc: 'Business intelligence and data exploration', category: 'Analytics', mcpUrl: 'https://looker.com', logo: fav('looker.com'), auth: 'apikey' },
  // Google Workspace
  { id: 'gmail', name: 'Gmail', desc: 'Read, compose and manage your emails', category: 'Google', mcpUrl: 'https://gmailmcp.googleapis.com/mcp/v1', logo: fav('gmail.com'), auth: 'composio' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Search, read and upload files', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('drive.google.com'), auth: 'composio' },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Manage events and schedule meetings', category: 'Google', mcpUrl: 'https://calendarmcp.googleapis.com/mcp/v1', logo: fav('calendar.google.com'), auth: 'composio' },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets and data analysis', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('sheets.google.com'), auth: 'composio' },
  { id: 'gdocs', name: 'Google Docs', desc: 'Documents and collaborative writing', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('docs.google.com'), auth: 'composio' },
  { id: 'gslides', name: 'Google Slides', desc: 'Presentations and slide decks', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('slides.google.com'), auth: 'composio' },
  { id: 'gforms', name: 'Google Forms', desc: 'Surveys, quizzes and form responses', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('forms.google.com'), auth: 'composio' },
  { id: 'gmeet', name: 'Google Meet', desc: 'Video meetings and conferencing', category: 'Google', mcpUrl: 'https://meet.google.com', logo: fav('meet.google.com'), auth: 'composio' },
  { id: 'gchat', name: 'Google Chat', desc: 'Team messaging and spaces', category: 'Google', mcpUrl: 'https://chat.google.com', logo: fav('chat.google.com'), auth: 'composio' },
  { id: 'gtasks', name: 'Google Tasks', desc: 'Task lists and to-dos', category: 'Google', mcpUrl: 'https://tasks.google.com', logo: fav('tasks.google.com'), auth: 'composio' },
  { id: 'youtube', name: 'YouTube', desc: 'Video search, transcripts and channel management', category: 'Google', mcpUrl: 'https://youtube.com', logo: fav('youtube.com'), auth: 'composio' },
  { id: 'youtubeanalytics', name: 'YouTube Analytics', desc: 'Channel and video performance data', category: 'Google', mcpUrl: 'https://studio.youtube.com', logo: fav('studio.youtube.com'), auth: 'composio' },
  { id: 'googleanalytics', name: 'Google Analytics', desc: 'Web analytics and reporting', category: 'Google', mcpUrl: 'https://analytics.google.com', logo: fav('analytics.google.com'), auth: 'composio' },
  { id: 'googleads', name: 'Google Ads', desc: 'Ad campaigns, keywords and performance', category: 'Google', mcpUrl: 'https://ads.google.com', logo: fav('ads.google.com'), auth: 'composio' },
  { id: 'googlebigquery', name: 'BigQuery', desc: 'Serverless data warehouse and SQL analytics', category: 'Google', mcpUrl: 'https://cloud.google.com', logo: fav('cloud.google.com'), auth: 'composio' },
  { id: 'looker', name: 'Looker Studio', desc: 'Dashboards and data visualisation', category: 'Google', mcpUrl: 'https://lookerstudio.google.com', logo: fav('lookerstudio.google.com'), auth: 'composio' },
  // Microsoft 365
  { id: 'outlook', name: 'Outlook', desc: 'Email, calendar and contacts', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('outlook.com'), auth: 'composio' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Cloud file storage and sharing', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('onedrive.com'), auth: 'composio' },
  { id: 'teams', name: 'Microsoft Teams', desc: 'Team messaging and video meetings', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('teams.microsoft.com'), auth: 'composio' },
  { id: 'excel', name: 'Microsoft Excel', desc: 'Spreadsheets and data analysis', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('excel.office.com'), auth: 'composio' },
  { id: 'word', name: 'Microsoft Word', desc: 'Documents and collaborative writing', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('word.office.com'), auth: 'composio' },
  { id: 'powerpoint', name: 'PowerPoint', desc: 'Presentations and slide decks', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('powerpoint.office.com'), auth: 'composio' },
  { id: 'sharepoint', name: 'SharePoint', desc: 'Intranet, document management and collaboration', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('sharepoint.com'), auth: 'composio' },
  { id: 'onenote', name: 'OneNote', desc: 'Notes, notebooks and knowledge capture', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('onenote.com'), auth: 'composio' },
  { id: 'mstodo', name: 'Microsoft To Do', desc: 'Tasks, lists and daily planning', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('todo.microsoft.com'), auth: 'composio' },
  { id: 'msplanner', name: 'Microsoft Planner', desc: 'Team task boards and project tracking', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('tasks.office.com'), auth: 'composio' },
  // Social
  { id: 'twitter', name: 'X (Twitter)', desc: 'Post, search and manage tweets', category: 'Social', mcpUrl: 'https://api.twitter.com', logo: fav('x.com'), auth: 'composio' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional network and content', category: 'Social', mcpUrl: 'https://api.linkedin.com', logo: fav('linkedin.com'), auth: 'composio' },
  { id: 'wordpress', name: 'WordPress', desc: 'CMS and blog management', category: 'Social', mcpUrl: 'https://wordpress.com', logo: fav('wordpress.com'), auth: 'composio' },
  { id: 'instagram', name: 'Instagram', desc: 'Post management and content publishing', category: 'Social', mcpUrl: 'https://graph.facebook.com', logo: fav('instagram.com'), auth: 'composio' },
  { id: 'pinterest', name: 'Pinterest', desc: 'Visual content and pin management', category: 'Social', mcpUrl: 'https://api.pinterest.com', logo: fav('pinterest.com'), auth: 'composio' },
  { id: 'tiktok', name: 'TikTok', desc: 'Short video creation and analytics', category: 'Social', mcpUrl: 'https://business-api.tiktok.com', logo: fav('tiktok.com'), auth: 'composio' },
  { id: 'medium', name: 'Medium', desc: 'Publishing articles and blog posts', category: 'Social', mcpUrl: 'https://api.medium.com', logo: fav('medium.com'), auth: 'apikey' },
  // E-commerce
  { id: 'shopify', name: 'Shopify', desc: 'Products, orders and store management', category: 'E-commerce', mcpUrl: 'https://mcp.shopify.com/mcp', logo: fav('shopify.com'), auth: 'composio' },
  { id: 'woocommerce', name: 'WooCommerce', desc: 'WordPress-based online store management', category: 'E-commerce', mcpUrl: 'https://woocommerce.com', logo: fav('woocommerce.com'), auth: 'composio' },
  { id: 'bigcommerce', name: 'BigCommerce', desc: 'Enterprise ecommerce platform', category: 'E-commerce', mcpUrl: 'https://bigcommerce.com', logo: fav('bigcommerce.com'), auth: 'apikey' },
  { id: 'etsy', name: 'Etsy', desc: 'Marketplace listings, orders and shop analytics', category: 'E-commerce', mcpUrl: 'https://openapi.etsy.com', logo: fav('etsy.com'), auth: 'apikey' },
  { id: 'amazon', name: 'Amazon Seller', desc: 'Product listings, orders and FBA management', category: 'E-commerce', mcpUrl: 'https://sellercentral.amazon.com', logo: fav('amazon.com'), auth: 'composio' },
  { id: 'flipkart', name: 'Flipkart Seller', desc: 'Product listings and seller account management', category: 'E-commerce', mcpUrl: 'https://seller.flipkart.com', logo: fav('flipkart.com'), auth: 'apikey' },
  { id: 'klaviyo', name: 'Klaviyo', desc: 'Email and SMS marketing for ecommerce', category: 'E-commerce', mcpUrl: 'https://a.klaviyo.com', logo: fav('klaviyo.com'), auth: 'composio' },
  // AI
  { id: 'replicate', name: 'Replicate', desc: 'Run AI models in the cloud', category: 'AI', mcpUrl: 'https://mcp.replicate.com/mcp', logo: fav('replicate.com'), auth: 'composio' },
  { id: 'huggingface', name: 'Hugging Face', desc: 'Open source AI models and datasets', category: 'AI', mcpUrl: 'https://mcp.huggingface.co/mcp', logo: fav('huggingface.co'), auth: 'composio' },
];

const LS_KEY = 'fi:connected-apps';
const LS_VERSION_KEY = 'fi:connect-version';
const LS_VERSION = '2';
const LS_OAUTH_SUCCESS_KEY = 'fi:oauth-success';
const LS_OAUTH_FAILED_KEY = 'fi:oauth-failed';

const readLS = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};
const writeLS = (key: string, val: string[]) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// The old elapsed-time heuristic produced false "connected" states - wipe them once on upgrade
const getInitialConnected = (): string[] => {
  try {
    if (localStorage.getItem(LS_VERSION_KEY) !== LS_VERSION) {
      localStorage.removeItem(LS_KEY);
      localStorage.setItem(LS_VERSION_KEY, LS_VERSION);
      return [];
    }
  } catch {}
  return readLS(LS_KEY);
};

const CATEGORIES = ['All', 'Creative', 'Communication', 'Productivity', 'CRM', 'Developer', 'Finance', 'Analytics', 'Google', 'Microsoft', 'Social', 'E-commerce', 'AI'];

// Competitor AI slugs to hide from the "Browse all integrations" search results
const COMPETITOR_SLUGS = ['openai', 'anthropic', 'perplexityai', 'deepseek', 'grok', 'gemini', 'mistral', 'cohere', 'claude'];

interface BrowseApp {
  category?: string;
  logo?: string;
  name?: string;
  slug: string;
}

const PRIVACY_BULLETS_THIRD_PARTY = [
  'Third-party connector - not built or maintained by Fi',
  'Fi accesses only what you approve during login',
  'You can disconnect at any time from this page',
];

interface BannerState {
  message: string;
  type: 'success' | 'error';
}

const AppIcon = memo(({ app, size = 36 }: { app: McpApp; size?: number }) => {
  const isDark = useIsDark();
  const [failed, setFailed] = useState(false);
  const src = LOGO_MAP[app.id] ?? app.logo;

  if (failed) {
    return (
      <div style={{
        alignItems: 'center',
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderRadius: size * 0.22,
        display: 'flex',
        flexShrink: 0,
        height: size,
        justifyContent: 'center',
        width: size,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.5 }}>{app.name.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div style={{
      alignItems: 'center',
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: size * 0.22,
      display: 'flex',
      flexShrink: 0,
      height: size,
      justifyContent: 'center',
      overflow: 'hidden',
      width: size,
    }}>
      <img alt={app.name} src={src}
        style={{ height: size * 0.6, objectFit: 'contain', width: size * 0.6 }}
        onError={() => setFailed(true)}
      />
    </div>
  );
});
AppIcon.displayName = 'AppIcon';

const BrowseAppCard = memo(({ app, onConnect }: { app: McpApp; onConnect: () => void }) => {
  const isDark = useIsDark();
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  return (
    <div style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, display: 'flex', gap: 12, padding: '12px 14px' }}>
      <AppIcon app={app} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</div>
        <div style={{ alignItems: 'center', display: 'flex', marginTop: 2 }}>
          <span style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: 6, color: textSub, fontSize: 10, padding: '1px 6px' }}>
            {app.desc}
          </span>
        </div>
      </div>
      <button
        style={{ background: 'transparent', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`, borderRadius: 8, color: text, cursor: 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '5px 14px', whiteSpace: 'nowrap' }}
        onClick={onConnect}>
        Connect
      </button>
    </div>
  );
});
BrowseAppCard.displayName = 'BrowseAppCard';

const ConnectPage = memo(() => {
  const isDark = useIsDark();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [connected, setConnected] = useState<string[]>(getInitialConnected);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [pollingApp, setPollingApp] = useState<string | null>(null);
  const [infoModalApp, setInfoModalApp] = useState<McpApp | null>(null);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseResults, setBrowseResults] = useState<BrowseApp[]>([]);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseCategory, setBrowseCategory] = useState('All');
  const [disconnectConfirm, setDisconnectConfirm] = useState<string | null>(null);

  // Tracks which app the currently-open OAuth tab belongs to, so a stale poll/focus
  // event for a previous app can't mark the wrong app as connected
  const pendingOAuthApp = useRef<string | null>(null);
  const pollingStartedAt = useRef<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preConnectionIds = useRef<Map<string, string>>(new Map());

  const installCustomPlugin = useToolStore((s) => s.installCustomPlugin);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

  const showBanner = useCallback((type: BannerState['type'], message: string) => {
    setBanner({ message, type });
  }, []);

  // Auto-dismiss toast with fade-out after ~3 seconds
  useEffect(() => {
    if (!banner) return;
    setBannerVisible(true);
    const fadeTimer = setTimeout(() => setBannerVisible(false), 2700);
    const removeTimer = setTimeout(() => setBanner(null), 3000);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [banner]);

  const markConnectedBulk = useCallback((ids: string[]) => {
    setConnected(prev => {
      const next = [...prev];
      for (const id of ids) {
        if (!next.includes(id)) next.push(id);
      }
      writeLS(LS_KEY, next);
      return next;
    });
  }, []);

  const markConnected = useCallback((id: string) => markConnectedBulk([id]), [markConnectedBulk]);

  const handleDisconnect = useCallback((id: string) => {
    setConnected(prev => {
      const next = prev.filter(x => x !== id);
      writeLS(LS_KEY, next);
      return next;
    });
  }, []);

  // On mount: restore connected state from the oauth_success URL param (set by the
  // connect-success page after a Composio OAuth flow completes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccessParam = params.get('oauth_success');

    if (oauthSuccessParam) {
      const app = MCP_APPS.find(a => a.id === oauthSuccessParam);
      if (app) {
        markConnected(app.id);
        showBanner('success', `${app.name} connected successfully`);
      }
      params.delete('oauth_success');
      const rest = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track which apps were already connected before this session
  const preExistingConnections = useRef<Set<string>>(new Set());

  // On mount: load existing Composio connections and mark the matching apps as connected
  useEffect(() => {
    fetch('/api/composio/connections')
      .then(r => r.json())
      .then(({ connections }) => {
        // eslint-disable-next-line no-console
        console.log('[OAuth Debug] mount: connections loaded', connections);
        if (connections && Array.isArray(connections)) {
          connections.forEach((conn: { appName?: string; status?: string }) => {
            const appId = Object.keys(COMPOSIO_APP_MAP).find(
              key => COMPOSIO_APP_MAP[key] === conn.appName?.toLowerCase(),
            );
            // eslint-disable-next-line no-console
            console.log('[OAuth Debug] mount: mapped connection', {
              appId,
              appName: conn.appName,
              status: conn.status,
            });
            if (appId) {
              preExistingConnections.current.add(appId);
              markConnected(appId);
            }
          });
        }
      })
      .catch(() => {});
  }, [markConnected]);

  // Search across Composio's full integration catalog for the "Browse all" modal.
  // An empty query returns Composio's curated list of popular apps, so the modal
  // shows results immediately on open rather than waiting for the user to type.
  useEffect(() => {
    if (!browseOpen) return;
    const query = browseQuery.trim();
    setBrowseLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/composio/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(({ items, total }: { items?: BrowseApp[]; total?: number }) => {
          const filtered = (items || []).filter(
            item => !COMPETITOR_SLUGS.includes(item.slug?.toLowerCase()),
          );
          setBrowseResults(filtered);
          setBrowseTotal(total ?? filtered.length);
          setBrowseCategory('All');
        })
        .catch(() => { setBrowseResults([]); setBrowseTotal(0); })
        .finally(() => setBrowseLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [browseQuery, browseOpen]);

  const stopPollingForOAuth = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPollingApp(null);
  }, []);

  // Checks localStorage for the flag set by the connect-success page once the OAuth tab
  // redirects back - only acts if the stored provider matches the app we're waiting on,
  // which prevents a stale signal from a previous attempt marking the wrong app connected
  const checkOAuthResult = useCallback(async () => {
    const pendingId = pendingOAuthApp.current;
    if (!pendingId) return;
    const app = MCP_APPS.find(a => a.id === pendingId);
    if (!app) return;

    try {
      const successRaw = localStorage.getItem(LS_OAUTH_SUCCESS_KEY);
      if (successRaw) {
        const data = JSON.parse(successRaw);
        if (data?.provider === app.id && pendingOAuthApp.current === app.id) {
          localStorage.removeItem(LS_OAUTH_SUCCESS_KEY);
          pendingOAuthApp.current = null;
          stopPollingForOAuth();
          markConnected(app.id);
          showBanner('success', `${app.name} connected successfully`);
          return;
        }
      }

      const failedRaw = localStorage.getItem(LS_OAUTH_FAILED_KEY);
      if (failedRaw) {
        const data = JSON.parse(failedRaw);
        if (data?.provider === app.id && pendingOAuthApp.current === app.id) {
          localStorage.removeItem(LS_OAUTH_FAILED_KEY);
          pendingOAuthApp.current = null;
          stopPollingForOAuth();
          showBanner('error', `Failed to connect ${app.name} - please try again`);
          return;
        }
      }

      // Also check Composio API directly - handles case where Composio shows their own success page
      const composioSlug = COMPOSIO_APP_MAP[app.id] || app.id;
      const res = await fetch(`/api/composio/check-connection?app=${composioSlug}`);
      if (res.ok) {
        const data = await res.json();
        const prevId = preConnectionIds.current.get(app.id);
        // eslint-disable-next-line no-console
        console.log('[OAuth Debug] checkOAuthResult', {
          appId: app.id,
          composioSlug,
          connected: data.connected,
          connectionId: data.connectionId,
          status: data.status,
          prevId,
          willMarkConnected:
            data.connected && data.connectionId && pendingOAuthApp.current === app.id && data.connectionId !== prevId,
        });
        if (data.connected && data.connectionId && pendingOAuthApp.current === app.id && data.connectionId !== prevId) {
          pendingOAuthApp.current = null;
          stopPollingForOAuth();
          markConnected(app.id);
          showBanner('success', `${app.name} connected successfully`);
        }
      }
    } catch {}
  }, [markConnected, showBanner, stopPollingForOAuth]);

  // Polls localStorage for the success/failure flag written by the connect-success page -
  // this is the only reliable signal since the OAuth tab runs in a separate browsing context.
  // Replaces any polling already running for a different app first, so a leftover interval
  // can't mark the wrong app connected (e.g. clicking Slack then Canva mid-flow)
  const startPollingForOAuth = useCallback((app: McpApp) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pendingOAuthApp.current = app.id;
    pollingStartedAt.current = Date.now();
    setPollingApp(app.id);

    // Only poll AFTER window focus returns (user closed/completed OAuth tab)
    // This prevents detecting pre-existing connections
    const onFocus = async () => {
      window.removeEventListener('focus', onFocus);
      if (!pendingOAuthApp.current) return;
      
      // Wait 2 seconds after focus for Composio to process the connection
      await new Promise(r => setTimeout(r, 2000));
      
      if (!pendingOAuthApp.current) return;

      const composioSlug = COMPOSIO_APP_MAP[app.id] || app.id;
      const prevId = preConnectionIds.current.get(app.id);

      try {
        const res = await fetch(`/api/composio/check-connection?app=${composioSlug}`);
        if (res.ok) {
          const data = await res.json();
          // eslint-disable-next-line no-console
          console.log('[OAuth Debug] onFocus check', {
            appId: app.id,
            composioSlug,
            connected: data.connected,
            connectionId: data.connectionId,
            status: data.status,
            prevId,
            willMarkConnected:
              data.connected && data.connectionId && data.connectionId !== prevId && pendingOAuthApp.current === app.id,
          });
          if (data.connected && data.connectionId && data.connectionId !== prevId && pendingOAuthApp.current === app.id) {
            pendingOAuthApp.current = null;
            stopPollingForOAuth();
            markConnected(app.id);
            showBanner('success', `${app.name} connected successfully`);
            return;
          }
        }
      } catch {}

      // If not connected after focus, poll a few more times
      let attempts = 0;
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 10 || !pendingOAuthApp.current) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          if (pendingOAuthApp.current) {
            pendingOAuthApp.current = null;
            stopPollingForOAuth();
          }
          return;
        }
        try {
          const res = await fetch(`/api/composio/check-connection?app=${composioSlug}`);
          if (res.ok) {
            const data = await res.json();
            // eslint-disable-next-line no-console
            console.log('[OAuth Debug] poll interval check', {
              appId: app.id,
              attempts,
              composioSlug,
              connected: data.connected,
              connectionId: data.connectionId,
              status: data.status,
              prevId,
              willMarkConnected:
                data.connected && data.connectionId && data.connectionId !== prevId && pendingOAuthApp.current === app.id,
            });
            if (data.connected && data.connectionId && data.connectionId !== prevId && pendingOAuthApp.current === app.id) {
              clearInterval(pollIntervalRef.current!);
              pollIntervalRef.current = null;
              pendingOAuthApp.current = null;
              stopPollingForOAuth();
              markConnected(app.id);
              showBanner('success', `${app.name} connected successfully`);
            }
          }
        } catch {}
      }, 2000);
    };

    window.addEventListener('focus', onFocus);

    // Timeout after 5 minutes
    setTimeout(() => {
      window.removeEventListener('focus', onFocus);
      if (pendingOAuthApp.current === app.id) {
        pendingOAuthApp.current = null;
        stopPollingForOAuth();
      }
    }, 300_000);
  }, [checkOAuthResult, stopPollingForOAuth]);

  // Window focus is a backup trigger - when the OAuth tab closes/redirects and the user
  // comes back to this tab, check localStorage immediately instead of waiting for the next tick
  // Focus listener removed - polling only happens after popup closes

  // When user navigates away or refreshes while OAuth is pending,
  // revoke the INITIALIZING connection so it doesn't cause false positives later
  useEffect(() => {
    const handleUnload = () => {
      if (!pendingOAuthApp.current) return;
      const appId = pendingOAuthApp.current;
      const composioSlug = COMPOSIO_APP_MAP[appId] || appId;
      // Use sendBeacon for reliability during page unload
      navigator.sendBeacon(
        `/api/composio/revoke-pending?app=${composioSlug}`,
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // When the info modal is dismissed or switches to a different app, cancel any polling
  // interval left running from a previous, abandoned attempt
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [infoModalApp]);

  const handleConnect = useCallback((app: McpApp) => {
    if (app.auth === 'coming_soon') return;

    if (app.auth === 'apikey') {
      setApiKeyModal(app.id);
      setApiKeyValue('');
      return;
    }

    // composio - show info modal first, then kick off the OAuth flow on confirm
    setInfoModalApp(app);
  }, []);

  const handleInfoConfirm = useCallback(async () => {
    if (!infoModalApp) return;
    const app = infoModalApp;
    setInfoModalApp(null);

    // Composio handles OAuth for every connector now - fetch the provider's auth URL,
    // open it in a new tab, and poll (plus listen for window focus) for the success/failure
    // flag written by the connect-success page once the OAuth tab redirects back
    setConnecting(app.id);
    try {
      const composioAppName = COMPOSIO_APP_MAP[app.id] || app.id;

      // Store existing connection ID before opening popup, so polling can tell a
      // genuinely new connection apart from one that already existed beforehand
      try {
        const preCheck = await fetch(`/api/composio/check-connection?app=${composioAppName}`);
        if (preCheck.ok) {
          const preData = await preCheck.json();
          // eslint-disable-next-line no-console
          console.log('[OAuth Debug] preCheck (before auth-url)', {
            appId: app.id,
            composioAppName,
            connected: preData.connected,
            connectionId: preData.connectionId,
            status: preData.status,
          });
          if (preData.connectionId) {
            preConnectionIds.current.set(app.id, preData.connectionId);
          } else {
            preConnectionIds.current.delete(app.id);
          }
        }
      } catch {}

      const response = await fetch(`/api/composio/auth-url?app=${composioAppName}`);
      const data = await response.json();
      if (data.url) {
        // After auth-url creates an INITIALIZING connection, store its ID so polling ignores it
        try {
          await new Promise(r => setTimeout(r, 500));
          const postCheck = await fetch(`/api/composio/check-connection?app=${composioAppName}&includeInitializing=true`);
          if (postCheck.ok) {
            const postData = await postCheck.json();
            // eslint-disable-next-line no-console
            console.log('[OAuth Debug] postCheck (after auth-url, before popup)', {
              appId: app.id,
              composioAppName,
              connected: postData.connected,
              connectionId: postData.connectionId,
              status: postData.status,
              prevIdBeforeOverwrite: preConnectionIds.current.get(app.id),
            });
            if (postData.connectionId) {
              // Do NOT overwrite prevId with INITIALIZING connection - keep original preCheck ID
          // preConnectionIds.current.set(app.id, postData.connectionId);
            }
          }
        } catch {}
        pendingOAuthApp.current = app.id;
        const popup = window.open(data.url, '_blank', 'width=600,height=700,left=200,top=100');
        if (!popup) {
          pendingOAuthApp.current = null;
          showBanner('error', `Failed to connect ${app.name} - please allow popups and try again`);
        } else {
          startPollingForOAuth(app);
        }
      } else {
        showBanner('error', `Failed to connect ${app.name} - please try again`);
      }
    } catch {
      showBanner('error', `Failed to connect ${app.name} - please try again`);
    } finally {
      setConnecting(null);
    }
  }, [infoModalApp, showBanner, startPollingForOAuth]);

  const handleSaveApiKey = useCallback(async () => {
    if (!apiKeyModal || !apiKeyValue.trim()) return;
    const app = MCP_APPS.find(a => a.id === apiKeyModal);
    if (!app) return;
    setSavingKey(true);
    try {
      await installCustomPlugin({
        customParams: {
          description: app.desc,
          mcp: { auth: { token: apiKeyValue.trim(), type: 'bearer' }, type: 'http', url: app.mcpUrl },
        },
        identifier: app.id,
        type: 'customPlugin',
      });
      markConnected(apiKeyModal);
      showBanner('success', `${app.name} connected successfully`);
      setApiKeyModal(null);
      setApiKeyValue('');
    } catch {
      showBanner('error', `Failed to connect ${app.name} - please try again`);
    } finally {
      setSavingKey(false);
    }
  }, [apiKeyModal, apiKeyValue, installCustomPlugin, markConnected, showBanner]);

  const connectedApps = MCP_APPS.filter(a => connected.includes(a.id));
  const unconnectedApps = MCP_APPS.filter(a => !connected.includes(a.id));

  const filteredUnconnected = unconnectedApps.filter(app => {
    const matchSearch = !search.trim() ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.desc.toLowerCase().includes(search.toLowerCase()) ||
      app.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || app.category === activeCategory;
    return matchSearch && matchCat;
  });

  const groupedByCategory: Record<string, McpApp[]> = {};
  filteredUnconnected.forEach(app => {
    if (!groupedByCategory[app.category]) groupedByCategory[app.category] = [];
    groupedByCategory[app.category].push(app);
  });

  const isBrowseSearching = browseQuery.trim().length >= 2;

  const browseApps: McpApp[] = browseResults.map(item => ({
    auth: 'composio',
    category: item.category || 'Other',
    desc: item.category || 'Integration',
    id: item.slug,
    logo: fav(slugToDomain(item.slug)),
    mcpUrl: '',
    name: formatAppName(item.slug),
  }));

  const browseCategories = ['All', ...Array.from(new Set(browseApps.map(a => a.category))).sort()];

  const browseFiltered = browseCategory === 'All'
    ? browseApps
    : browseApps.filter(a => a.category === browseCategory);

  const browseGrouped: Record<string, McpApp[]> = {};
  browseFiltered.forEach(app => {
    if (!browseGrouped[app.category]) browseGrouped[app.category] = [];
    browseGrouped[app.category].push(app);
  });

  const modalApp = MCP_APPS.find(a => a.id === apiKeyModal);

  return (
    <div style={{ background: bg, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <style>{'.hide-scrollbar::-webkit-scrollbar { display: none; }'}</style>

      {/* Header */}
      <div style={{ background: isDark ? '#1e1e1d' : '#ffffff', borderBottom: `0.5px solid ${border}`, flexShrink: 0, padding: '20px 32px 16px' }}>
        <div style={{ alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: text, fontSize: 20, fontWeight: 500, margin: 0 }}>Connect</h1>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)', fontSize: 13, margin: '4px 0 0' }}>
              Connect Fi to your apps. OAuth apps connect with a single login - no API keys needed.
            </p>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
            <div style={{ color: textSub, fontSize: 12 }}>{MCP_APPS.length}+ integrations</div>
            <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
              <svg fill="none" height="14" style={{ flexShrink: 0 }} viewBox="0 0 14 14" width="14">
                <path d="M7 1L2 3.5V7C2 9.8 4.2 12.4 7 13C9.8 12.4 12 9.8 12 7V3.5L7 1Z"
                  fill={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                  stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} strokeWidth="1" />
                <path d="M5 7L6.5 8.5L9.5 5.5"
                  stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" />
              </svg>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11 }}>Fi x Composio</span>
            </div>
          </div>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginTop: 16 }}>
          <div style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 10, display: 'flex', flexShrink: 0, gap: 8, padding: '7px 12px', width: 260 }}>
            <Search size={14} style={{ color: textTertiary, flexShrink: 0 }} />
            <input
              placeholder="Search connectors..."
              style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 13, outline: 'none' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={{ background: 'none', border: 'none', color: textTertiary, cursor: 'pointer', display: 'flex', padding: 0 }} onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="hide-scrollbar" style={{ display: 'flex', flex: 1, gap: 6, msOverflowStyle: 'none' as any, overflowX: 'auto', scrollbarWidth: 'none' as any }}>
            {CATEGORIES.map(cat => (
              <button key={cat} style={{ background: activeCategory === cat ? text : 'transparent', border: `0.5px solid ${activeCategory === cat ? 'transparent' : border}`, borderRadius: 20, color: activeCategory === cat ? bg : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'), cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 14px', transition: 'all 0.15s' }}
                onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast - minimal floating pill, bottom-center, auto-dismisses with a fade */}
      {banner && (
        <div style={{
          alignItems: 'center',
          background: isDark ? '#2c2c2b' : '#ffffff',
          border: `0.5px solid ${border}`,
          borderRadius: 100,
          bottom: 24,
          boxShadow: 'none',
          display: 'flex',
          fontSize: 12,
          gap: 8,
          left: '50%',
          opacity: bannerVisible ? 1 : 0,
          padding: '8px 16px',
          position: 'fixed',
          transform: 'translateX(-50%)',
          transition: 'opacity 0.3s ease',
          zIndex: 1000,
        }}>
          <span style={{
            background: banner.type === 'success' ? '#22c55e' : '#dc2626',
            borderRadius: '50%',
            flexShrink: 0,
            height: 6,
            width: 6,
          }} />
          <span style={{ color: text }}>{banner.message}</span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px 40px' }}>

        {/* Connected section */}
        {connectedApps.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Connected</span>
              <span style={{ background: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.1)', borderRadius: 10, color: isDark ? '#4ade80' : '#16a34a', fontSize: 11, padding: '1px 7px' }}>
                {connectedApps.length}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {connectedApps.map(app => {
                return (
                  <div key={app.id} style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.2)'}`, borderRadius: 12, display: 'flex', gap: 12, padding: '12px 14px' }}>
                    <AppIcon app={app} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                        <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                        <span style={{ alignItems: 'center', background: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.1)', borderRadius: 6, color: isDark ? '#4ade80' : '#16a34a', display: 'flex', fontSize: 10, fontWeight: 600, gap: 2, padding: '1px 6px' }}>
                          <Check size={9} /> Connected
                        </span>
                      </div>
                      <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.desc}
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 11, flexShrink: 0, padding: '4px 10px', whiteSpace: 'nowrap' }}
                      onClick={() => setDisconnectConfirm(app.id)}>
                      Disconnect
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available apps grouped by category */}
        {Object.entries(groupedByCategory).map(([category, apps]) => {
          const isExpanded = expandedCategories.has(category);
          const visibleApps = isExpanded ? apps : apps.slice(0, 8);
          const hiddenCount = apps.length - 8;
          return (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>
              {category}
            </div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {visibleApps.map(app => {
                const isConnecting = connecting === app.id;
                const isPolling = pollingApp === app.id;
                const isBusy = isConnecting || isPolling;
                const isComingSoon = app.auth === 'coming_soon';
                return (
                  <div key={app.id}
                    style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, cursor: isComingSoon ? 'default' : isBusy ? 'wait' : 'pointer', display: 'flex', gap: 12, opacity: isComingSoon ? 0.65 : 1, padding: '12px 14px', transition: 'border-color 0.1s' }}
                    onClick={() => { if (!isBusy && !isComingSoon) handleConnect(app); }}
                    onMouseEnter={e => { if (!isBusy && !isComingSoon) e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = border; }}>
                    <AppIcon app={app} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                        <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                        {app.auth === 'apikey' && (
                          <span style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `0.5px solid ${border}`, borderRadius: 6, color: textTertiary, display: 'flex', fontSize: 10, gap: 3, padding: '1px 6px' }}>
                            <Key size={9} /> API key
                          </span>
                        )}
                      </div>
                      <div style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isPolling ? 'Waiting for authorization...' : isConnecting ? 'Connecting...' : app.desc}
                      </div>
                    </div>
                    {isComingSoon ? (
                      <span style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: `0.5px solid ${border}`, borderRadius: 8, color: textTertiary, flexShrink: 0, fontSize: 11, padding: '5px 10px', whiteSpace: 'nowrap' }}>
                        Coming Soon
                      </span>
                    ) : (
                      <button
                        disabled={isBusy}
                        style={{ background: 'transparent', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`, borderRadius: 8, color: text, cursor: isBusy ? 'wait' : 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 700, opacity: isBusy ? 0.5 : 1, padding: '5px 14px', whiteSpace: 'nowrap' }}
                        onClick={e => { e.stopPropagation(); if (!isBusy) handleConnect(app); }}>
                        {isPolling ? 'Waiting...' : isConnecting ? '...' : 'Connect'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {hiddenCount > 0 && (
              <button
                style={{ background: 'none', border: 'none', color: textSub, cursor: 'pointer', fontSize: 12, fontWeight: 500, marginTop: 10, padding: '4px 0' }}
                onClick={() => toggleCategory(category)}>
                {isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
              </button>
            )}
          </div>
          );
        })}

        {filteredUnconnected.length === 0 && connectedApps.length === 0 && (
          <div style={{ color: textSub, fontSize: 13, padding: '60px 0', textAlign: 'center' }}>
            No connectors found for &ldquo;{search}&rdquo;
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button
            style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 10, color: textSub, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '10px 20px' }}
            onClick={() => setBrowseOpen(true)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; }}>
            Browse all apps →
          </button>
        </div>

        <div style={{
          alignItems: 'center',
          borderTop: `0.5px solid ${border}`,
          color: textTertiary,
          display: 'flex',
          fontSize: 11,
          gap: 6,
          justifyContent: 'center',
          marginTop: 24,
          paddingTop: 16,
        }}>
          <svg fill="none" height="12" viewBox="0 0 14 14" width="12">
            <path d="M7 1L2 3.5V7C2 9.8 4.2 12.4 7 13C9.8 12.4 12 9.8 12 7V3.5L7 1Z"
              fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M5 7L6.5 8.5L9.5 5.5"
              stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" />
          </svg>
          Connections powered by Fi x Composio - encrypted, SOC 2 compliant
        </div>
      </div>

      {/* Browse all integrations - full-screen search across Composio's catalog */}
      {browseOpen && (
        <div style={{ background: bg, bottom: 0, display: 'flex', flexDirection: 'column', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 200 }}>
          <div style={{ alignItems: 'center', borderBottom: `0.5px solid ${border}`, display: 'flex', justifyContent: 'space-between', padding: '20px 24px' }}>
            <button
              style={{ alignItems: 'center', background: 'none', border: 'none', color: textSub, cursor: 'pointer', display: 'flex', fontSize: 13, gap: 6, padding: 6 }}
              onClick={() => { setBrowseOpen(false); setBrowseQuery(''); setBrowseResults([]); }}>
              ← Back to Connect
            </button>
            <div style={{ color: text, fontSize: 18, fontWeight: 500 }}>All Apps</div>
            <div style={{ width: 96 }} />
          </div>

          <div style={{ borderBottom: `0.5px solid ${border}`, padding: '16px 24px' }}>
            <div style={{ maxWidth: 480, position: 'relative' }}>
              <Search size={14} style={{ color: textTertiary, left: 12, position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                autoFocus
                placeholder="Search 1,000+ integrations..."
                style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 8, color: text, fontSize: 13, outline: 'none', padding: '10px 12px 10px 34px', width: '100%' }}
                value={browseQuery}
                onChange={e => setBrowseQuery(e.target.value)}
              />
            </div>
            <div style={{ color: textTertiary, fontSize: 11, marginTop: 8 }}>
              {isBrowseSearching
                ? `${browseFiltered.length} results for "${browseQuery.trim()}"`
                : `${browseTotal || browseApps.length} apps available`}
            </div>
            {browseCategories.length > 2 && (
              <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, marginTop: 12, msOverflowStyle: 'none' as any, overflowX: 'auto', scrollbarWidth: 'none' as any }}>
                {browseCategories.map(cat => (
                  <button key={cat}
                    style={{ background: browseCategory === cat ? text : 'transparent', border: `0.5px solid ${browseCategory === cat ? 'transparent' : border}`, borderRadius: 20, color: browseCategory === cat ? bg : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'), cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 14px', transition: 'all 0.15s' }}
                    onClick={() => setBrowseCategory(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {browseLoading ? (
              <div style={{ color: textSub, fontSize: 13, padding: '60px 0', textAlign: 'center' }}>
                Searching...
              </div>
            ) : browseFiltered.length === 0 ? (
              <div style={{ color: textSub, fontSize: 13, padding: '60px 0', textAlign: 'center' }}>
                No integrations found for &ldquo;{browseQuery}&rdquo;
              </div>
            ) : isBrowseSearching ? (
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {browseFiltered.map(app => <BrowseAppCard app={app} key={app.id} onConnect={() => { setBrowseOpen(false); handleConnect(app); }} />)}
              </div>
            ) : (
              Object.entries(browseGrouped).map(([category, apps]) => (
                <div key={category} style={{ marginBottom: 24 }}>
                  <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>
                    {category} ({apps.length})
                  </div>
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {apps.map(app => <BrowseAppCard app={app} key={app.id} onConnect={() => { setBrowseOpen(false); handleConnect(app); }} />)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Info modal - shown for all OAuth-style apps before connecting */}
      {infoModalApp && (
        <div
          style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 }}
          onClick={() => setInfoModalApp(null)}>
          <div
            style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: 400, padding: '24px', width: '90%' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
              <AppIcon app={infoModalApp} size={56} />
              <div style={{ color: text, fontSize: 18, fontWeight: 500, marginTop: 12 }}>{infoModalApp.name}</div>
              <div style={{ color: textSub, fontSize: 12, marginTop: 2 }}>{infoModalApp.category}</div>
            </div>

            <p style={{ color: textSub, fontSize: 13, lineHeight: 1.55, margin: '0 0 14px', textAlign: 'center' }}>{infoModalApp.desc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {PRIVACY_BULLETS_THIRD_PARTY.map(bullet => (
                <div key={bullet} style={{ alignItems: 'flex-start', color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)', display: 'flex', fontSize: 12, gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: textTertiary, flexShrink: 0 }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <p style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)', fontSize: 11, lineHeight: 1.5, margin: '0 0 20px' }}>
              Third-party connectors are not built or maintained by Fi. Use caution when granting access to external services.
            </p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 13, padding: '8px 16px' }}
                onClick={() => setInfoModalApp(null)}>
                Cancel
              </button>
              <button style={{ background: text, border: 'none', borderRadius: 8, color: bg, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '8px 16px' }}
                onClick={() => void handleInfoConfirm()}>
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect confirmation modal */}
      {disconnectConfirm && (() => {
        const app = MCP_APPS.find(a => a.id === disconnectConfirm);
        return (
          <div style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 200 }}
            onClick={() => setDisconnectConfirm(null)}>
            <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 16, padding: '24px', width: 380 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ color: text, fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
                Disconnect {app?.name}?
              </div>
              <div style={{ color: textSub, fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
                This will remove {app?.name}&apos;s access to your Fi account. You can reconnect at any time.
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 13, padding: '8px 16px' }}
                  onClick={() => setDisconnectConfirm(null)}>
                  Cancel
                </button>
                <button style={{ background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '8px 16px' }}
                  onClick={() => { handleDisconnect(disconnectConfirm); setDisconnectConfirm(null); }}>
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* API Key modal */}
      {apiKeyModal && modalApp && (
        <div
          style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 }}
          onClick={() => setApiKeyModal(null)}>
          <div
            style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: 400, padding: '24px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 20 }}>
              <AppIcon app={modalApp} />
              <div>
                <div style={{ color: text, fontSize: 15, fontWeight: 500 }}>Connect {modalApp.name}</div>
                <div style={{ color: textSub, fontSize: 12, marginTop: 2 }}>Enter your API key to connect</div>
              </div>
            </div>
            <div style={{ color: textSub, fontSize: 12, marginBottom: 8 }}>
              Get your API key from{' '}
              <a href={modalApp.mcpUrl} rel="noreferrer" style={{ color: text }} target="_blank">{modalApp.name} dashboard</a>
            </div>
            <input
              placeholder="Paste your API key here..."
              style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', border: `0.5px solid ${border}`, borderRadius: 8, color: text, fontSize: 13, marginBottom: 16, outline: 'none', padding: '10px 12px', width: '100%' }}
              type="password"
              value={apiKeyValue}
              onChange={e => setApiKeyValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSaveApiKey(); }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button disabled={savingKey} style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 13, padding: '8px 16px' }}
                onClick={() => setApiKeyModal(null)}>
                Cancel
              </button>
              <button disabled={!apiKeyValue.trim() || savingKey} style={{ background: apiKeyValue.trim() && !savingKey ? text : textTertiary, border: 'none', borderRadius: 8, color: bg, cursor: apiKeyValue.trim() && !savingKey ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 500, padding: '8px 16px' }}
                onClick={() => void handleSaveApiKey()}>
                {savingKey ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {banner === null && null}
    </div>
  );
});

ConnectPage.displayName = 'ConnectPage';
export default ConnectPage;
