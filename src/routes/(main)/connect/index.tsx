'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { Search, X, Check, Key, AlertCircle } from 'lucide-react';
import { signIn, listAccounts } from '@/libs/better-auth/auth-client';
import { useIsDark } from '@/hooks/useIsDark';
import { useToolStore } from '@/store/tool';

const cb = (domain: string) => `https://logo.clearbit.com/${domain}`;
const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const LOGO_OVERRIDES: Record<string, string> = {
  gmail: cb('gmail.com'),
  gdrive: cb('drive.google.com'),
  gcalendar: cb('calendar.google.com'),
  gsheets: cb('sheets.google.com'),
  gdocs: cb('docs.google.com'),
  gslides: cb('slides.google.com'),
  gforms: cb('forms.google.com'),
  gmeet: cb('meet.google.com'),
  gchat: cb('chat.google.com'),
  gtasks: cb('tasks.google.com'),
  youtube: cb('youtube.com'),
  ytanalytic: cb('youtube.com'),
  gads: cb('ads.google.com'),
  googleanalytics: cb('analytics.google.com'),
  bigquery: cb('cloud.google.com'),
  lookerstudio: cb('lookerstudio.google.com'),
  firebase: cb('firebase.google.com'),
  outlook: cb('outlook.com'),
  onedrive: cb('onedrive.com'),
  teams: cb('microsoft.com'),
  excel: cb('microsoft.com'),
  word: cb('microsoft.com'),
  powerpoint: cb('microsoft.com'),
  sharepoint: cb('sharepoint.com'),
  onenote: cb('onenote.com'),
  mstodo: cb('microsoft.com'),
  msplanner: cb('microsoft.com'),
  atlassian: cb('atlassian.com'),
  whatsapp: cb('whatsapp.com'),
  aws: cb('aws.amazon.com'),
  flipkart: cb('flipkart.com'),
  quickbooks: cb('quickbooks.intuit.com'),
  huggingface: cb('huggingface.co'),
  higgsfield: cb('higgsfield.ai'),
};

const getLogo = (id: string, domain: string) => LOGO_OVERRIDES[id] ?? fav(domain);

const GOOGLE_APP_IDS = ['gmail','gdrive','gcalendar','gsheets','gdocs','gslides','gforms','gmeet','gchat','gtasks','youtube','ytanalytic','gads','googleanalytics','bigquery','lookerstudio'];
const MICROSOFT_APP_IDS = ['outlook','onedrive','teams','excel','word','powerpoint','sharepoint','onenote','mstodo','msplanner'];

const OAUTH_URLS: Record<string, string> = {
  slack: 'https://slack.com/oauth/v2/authorize?client_id=11283223980215.11300538241825&scope=channels:read,channels:history,chat:write,users:read,search:read,files:read,groups:read,im:read,mpim:read&redirect_uri=http://127.0.0.1:3010/api/auth/callback/slack',
  hubspot: 'https://app.hubspot.com/oauth/authorize?client_id=f030ab61-bfaf-4a80-8c27-2a4d2784016b&scope=crm.objects.contacts.read crm.objects.deals.read&redirect_uri=http://127.0.0.1:3010/api/auth/callback/hubspot',
  notion: 'https://api.notion.com/v1/oauth/authorize?client_id=377d872b-594c-81fc-9c4f-00374782bd6e&response_type=code&owner=user&redirect_uri=http://127.0.0.1:3010/api/auth/callback/notion',
  github: 'https://github.com/login/oauth/authorize?client_id=Ov23lijVWI91JZFThB12&scope=repo,user,read:org&redirect_uri=http://127.0.0.1:3010/api/auth/callback/github',
  figma: 'https://www.figma.com/oauth?client_id=jAAgh1HbOPtzxprXTIx6UE&redirect_uri=http://127.0.0.1:3010/api/auth/callback/figma&scope=file_read&response_type=code',
  linear: 'https://linear.app/oauth/authorize?client_id=4a55ee60d83c5cb6dfbd1e8f23a87b13&redirect_uri=http://127.0.0.1:3010/api/auth/callback/linear&response_type=code&scope=read,write',
  asana: 'https://app.asana.com/-/oauth_authorize?client_id=1215470227190828&redirect_uri=http://127.0.0.1:3010/api/auth/callback/asana&response_type=code',
  atlassian: 'https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=JGpbzD66rrV2TRfAleKCthJ6NgJh2GyA&scope=read:jira-work%20write:jira-work%20read:confluence-content.all&redirect_uri=http://127.0.0.1:3010/api/auth/callback/atlassian&response_type=code&prompt=consent',
  box: 'https://account.box.com/api/oauth2/authorize?client_id=kkhdqrucdyucer9ebvsb8xtpd9siugxl&redirect_uri=http://127.0.0.1:3010/api/auth/callback/box&response_type=code',
  dropbox: 'https://www.dropbox.com/oauth2/authorize?client_id=vgnmbsj727pkesr&redirect_uri=http://127.0.0.1:3010/api/auth/callback/dropbox&response_type=code&token_access_type=offline',
  canva: 'https://www.canva.com/api/oauth/authorize?client_id=OC-AZ6en9YG18wS&redirect_uri=http://127.0.0.1:3010/api/auth/callback/canva&response_type=code&scope=asset:read%20asset:write%20design:content:read%20design:content:write%20design:meta:read%20profile:read',
  shopify: 'https://accounts.shopify.com/oauth/authorize?client_id=f24744b60760fff8f77947d688f78849&redirect_uri=http://127.0.0.1:3010/api/auth/callback/shopify&response_type=code',
  paypal: 'https://www.sandbox.paypal.com/signin/authorize?client_id=AWgCuTemLtUiU1FFt27zA8yPqbU6D-rb3Wcucw9EVPNl_kPDaFMAfTjnFD5cJbxENvsZORvISEUMjvgz&redirect_uri=http://127.0.0.1:3010/api/auth/callback/paypal&response_type=code&scope=openid%20profile%20email',
};

type AppAuth = 'google' | 'microsoft' | 'oauth_registered' | 'oauth_dcr' | 'apikey' | 'coming_soon';

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
  { id: 'higgsfield', name: 'Higgsfield', desc: 'AI video generation — Sora, Veo3, Kling, 30+ models', category: 'Creative', mcpUrl: 'https://mcp.higgsfield.ai/mcp', logo: getLogo('higgsfield', 'higgsfield.ai'), auth: 'apikey' },
  { id: 'canva', name: 'Canva', desc: 'Create designs, presentations and visual content', category: 'Creative', mcpUrl: 'https://mcp.canva.com/mcp', logo: getLogo('canva', 'canva.com'), auth: 'oauth_registered' },
  { id: 'figma', name: 'Figma', desc: 'Design files, components and prototypes', category: 'Creative', mcpUrl: 'https://mcp.figma.com/mcp', logo: getLogo('figma', 'figma.com'), auth: 'oauth_registered' },
  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'AI voice generation and text to speech', category: 'Creative', mcpUrl: 'https://api.elevenlabs.io', logo: getLogo('elevenlabs', 'elevenlabs.io'), auth: 'apikey' },
  { id: 'runway', name: 'Runway', desc: 'AI video and image generation tools', category: 'Creative', mcpUrl: 'https://api.dev.runwayml.com', logo: getLogo('runway', 'runwayml.com'), auth: 'apikey' },
  { id: 'adobe', name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere and more', category: 'Creative', mcpUrl: 'https://adobeioruntime.net', logo: getLogo('adobe', 'adobe.com'), auth: 'apikey' },
  // Communication
  { id: 'slack', name: 'Slack', desc: 'Send messages, search conversations, manage channels', category: 'Communication', mcpUrl: 'https://mcp.slack.com/mcp', logo: getLogo('slack', 'slack.com'), auth: 'oauth_registered' },
  { id: 'discord', name: 'Discord', desc: 'Messaging, servers and community management', category: 'Communication', mcpUrl: 'https://discord.com/api', logo: getLogo('discord', 'discord.com'), auth: 'apikey' },
  { id: 'telegram', name: 'Telegram', desc: 'Messaging and bot automation', category: 'Communication', mcpUrl: 'https://api.telegram.org', logo: getLogo('telegram', 'telegram.org'), auth: 'apikey' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Business messaging and customer engagement', category: 'Communication', mcpUrl: 'https://graph.facebook.com', logo: getLogo('whatsapp', 'business.whatsapp.com'), auth: 'apikey' },
  { id: 'zoom', name: 'Zoom', desc: 'Video meetings, webinars and recordings', category: 'Communication', mcpUrl: 'https://api.zoom.us/v2', logo: getLogo('zoom', 'zoom.us'), auth: 'apikey' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS, voice calls and messaging APIs', category: 'Communication', mcpUrl: 'https://api.twilio.com', logo: getLogo('twilio', 'twilio.com'), auth: 'apikey' },
  // Productivity
  { id: 'notion', name: 'Notion', desc: 'Read and write pages, databases and workspaces', category: 'Productivity', mcpUrl: 'https://mcp.notion.com/mcp', logo: getLogo('notion', 'notion.so'), auth: 'oauth_registered' },
  { id: 'asana', name: 'Asana', desc: 'Projects, tasks and team workflow management', category: 'Productivity', mcpUrl: 'https://mcp.asana.com/mcp', logo: getLogo('asana', 'asana.com'), auth: 'oauth_registered' },
  { id: 'linear', name: 'Linear', desc: 'Issues, projects, cycles and team management', category: 'Productivity', mcpUrl: 'https://mcp.linear.app/mcp', logo: getLogo('linear', 'linear.app'), auth: 'oauth_registered' },
  { id: 'monday', name: 'Monday.com', desc: 'Boards, items and project tracking', category: 'Productivity', mcpUrl: 'https://api.monday.com', logo: getLogo('monday', 'monday.com'), auth: 'apikey' },
  { id: 'clickup', name: 'ClickUp', desc: 'Tasks, docs and project collaboration', category: 'Productivity', mcpUrl: 'https://api.clickup.com', logo: getLogo('clickup', 'clickup.com'), auth: 'coming_soon' },
  { id: 'box', name: 'Box', desc: 'Enterprise file storage, metadata and sharing', category: 'Productivity', mcpUrl: 'https://mcp.box.com/mcp', logo: getLogo('box', 'box.com'), auth: 'oauth_registered' },
  { id: 'dropbox', name: 'Dropbox', desc: 'Cloud file storage and collaboration', category: 'Productivity', mcpUrl: 'https://api.dropbox.com', logo: getLogo('dropbox', 'dropbox.com'), auth: 'oauth_registered' },
  { id: 'airtable', name: 'Airtable', desc: 'Database, spreadsheet and workflow platform', category: 'Productivity', mcpUrl: 'https://mcp.airtable.com/mcp', logo: getLogo('airtable', 'airtable.com'), auth: 'oauth_dcr' },
  { id: 'todoist', name: 'Todoist', desc: 'Task management and to-do lists', category: 'Productivity', mcpUrl: 'https://api.todoist.com', logo: getLogo('todoist', 'todoist.com'), auth: 'apikey' },
  { id: 'trello', name: 'Trello', desc: 'Visual boards and card-based task tracking', category: 'Productivity', mcpUrl: 'https://api.trello.com', logo: getLogo('trello', 'trello.com'), auth: 'apikey' },
  // CRM
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM contacts, deals and marketing pipelines', category: 'CRM', mcpUrl: 'https://mcp.hubspot.com', logo: getLogo('hubspot', 'hubspot.com'), auth: 'oauth_registered' },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM leads, opportunities and contacts', category: 'CRM', mcpUrl: 'https://mcp.salesforce.com/mcp', logo: getLogo('salesforce', 'salesforce.com'), auth: 'coming_soon' },
  { id: 'clay', name: 'Clay', desc: 'Data enrichment, lead lists and CRM sync', category: 'CRM', mcpUrl: 'https://api.clay.com', logo: getLogo('clay', 'clay.run'), auth: 'apikey' },
  { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets and interactions', category: 'CRM', mcpUrl: 'https://api.zendesk.com', logo: getLogo('zendesk', 'zendesk.com'), auth: 'apikey' },
  { id: 'intercom', name: 'Intercom', desc: 'Customer messaging and support platform', category: 'CRM', mcpUrl: 'https://mcp.intercom.com', logo: getLogo('intercom', 'intercom.com'), auth: 'oauth_dcr' },
  { id: 'pipedrive', name: 'Pipedrive', desc: 'Sales pipeline and deal management', category: 'CRM', mcpUrl: 'https://api.pipedrive.com', logo: getLogo('pipedrive', 'pipedrive.com'), auth: 'apikey' },
  // Developer
  { id: 'github', name: 'GitHub', desc: 'Repositories, issues, PRs and workflows', category: 'Developer', mcpUrl: 'https://api.githubcopilot.com/mcp/', logo: getLogo('github', 'github.com'), auth: 'oauth_registered' },
  { id: 'gitlab', name: 'GitLab', desc: 'Repository, CI/CD and DevOps platform', category: 'Developer', mcpUrl: 'https://gitlab.com', logo: getLogo('gitlab', 'gitlab.com'), auth: 'apikey' },
  { id: 'vercel', name: 'Vercel', desc: 'Deployments, logs and project environments', category: 'Developer', mcpUrl: 'https://mcp.vercel.com', logo: getLogo('vercel', 'vercel.com'), auth: 'coming_soon' },
  { id: 'sentry', name: 'Sentry', desc: 'Error tracking, issues and performance', category: 'Developer', mcpUrl: 'https://mcp.sentry.dev/mcp', logo: getLogo('sentry', 'sentry.io'), auth: 'oauth_dcr' },
  { id: 'supabase', name: 'Supabase', desc: 'Database, auth, storage and realtime', category: 'Developer', mcpUrl: 'https://mcp.supabase.com/mcp', logo: getLogo('supabase', 'supabase.com'), auth: 'oauth_dcr' },
  { id: 'cloudflare', name: 'Cloudflare', desc: 'Workers, KV storage and DNS management', category: 'Developer', mcpUrl: 'https://mcp.cloudflare.com/mcp', logo: getLogo('cloudflare', 'cloudflare.com'), auth: 'oauth_dcr' },
  { id: 'neon', name: 'Neon', desc: 'Serverless Postgres with branching', category: 'Developer', mcpUrl: 'https://mcp.neon.tech/mcp', logo: getLogo('neon', 'neon.tech'), auth: 'oauth_dcr' },
  { id: 'atlassian', name: 'Jira & Confluence', desc: 'Issues, tickets and team documentation', category: 'Developer', mcpUrl: 'https://mcp.atlassian.com/v1/mcp', logo: getLogo('atlassian', 'atlassian.com'), auth: 'oauth_registered' },
  { id: 'firebase', name: 'Firebase', desc: 'App backend, Firestore, Auth and hosting', category: 'Developer', mcpUrl: 'https://firebase.google.com', logo: getLogo('firebase', 'firebase.google.com'), auth: 'apikey' },
  { id: 'postman', name: 'Postman', desc: 'API development and testing platform', category: 'Developer', mcpUrl: 'https://api.getpostman.com', logo: getLogo('postman', 'postman.com'), auth: 'apikey' },
  { id: 'aws', name: 'AWS', desc: 'Cloud infrastructure and services', category: 'Developer', mcpUrl: 'https://aws.amazon.com', logo: getLogo('aws', 'aws.amazon.com'), auth: 'apikey' },
  { id: 'datadog', name: 'Datadog', desc: 'Monitoring, metrics and observability', category: 'Developer', mcpUrl: 'https://api.datadoghq.com', logo: getLogo('datadog', 'datadoghq.com'), auth: 'apikey' },
  { id: 'pagerduty', name: 'PagerDuty', desc: 'Incident management and on-call alerting', category: 'Developer', mcpUrl: 'https://api.pagerduty.com', logo: getLogo('pagerduty', 'pagerduty.com'), auth: 'apikey' },
  // Finance
  { id: 'stripe', name: 'Stripe', desc: 'Payments, subscriptions and invoices', category: 'Finance', mcpUrl: 'https://mcp.stripe.com', logo: getLogo('stripe', 'stripe.com'), auth: 'oauth_dcr' },
  { id: 'paypal', name: 'PayPal', desc: 'Payments, invoices and transactions', category: 'Finance', mcpUrl: 'https://mcp.paypal.com/http', logo: getLogo('paypal', 'paypal.com'), auth: 'oauth_registered' },
  { id: 'cashfree', name: 'Cashfree', desc: 'Payment gateway and payouts (India)', category: 'Finance', mcpUrl: 'https://api.cashfree.com', logo: getLogo('cashfree', 'cashfree.com'), auth: 'apikey' },
  { id: 'razorpay', name: 'Razorpay', desc: 'Payment gateway for India', category: 'Finance', mcpUrl: 'https://api.razorpay.com', logo: getLogo('razorpay', 'razorpay.com'), auth: 'apikey' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting and financial management', category: 'Finance', mcpUrl: 'https://quickbooks.intuit.com', logo: getLogo('quickbooks', 'quickbooks.intuit.com'), auth: 'apikey' },
  { id: 'xero', name: 'Xero', desc: 'Cloud accounting and bookkeeping', category: 'Finance', mcpUrl: 'https://api.xero.com', logo: getLogo('xero', 'xero.com'), auth: 'apikey' },
  { id: 'plaid', name: 'Plaid', desc: 'Bank account connections and financial data', category: 'Finance', mcpUrl: 'https://api.plaid.com', logo: getLogo('plaid', 'plaid.com'), auth: 'coming_soon' },
  { id: 'brex', name: 'Brex', desc: 'Business banking and spend management', category: 'Finance', mcpUrl: 'https://platform.brexapis.com', logo: getLogo('brex', 'brex.com'), auth: 'apikey' },
  // Analytics
  { id: 'amplitude', name: 'Amplitude', desc: 'Product analytics, user journeys and A/B testing', category: 'Analytics', mcpUrl: 'https://mcp.amplitude.com/mcp', logo: getLogo('amplitude', 'amplitude.com'), auth: 'apikey' },
  { id: 'hex', name: 'Hex', desc: 'Data notebooks, analytics and interactive charts', category: 'Analytics', mcpUrl: 'https://mcp.hex.tech/mcp', logo: getLogo('hex', 'hex.tech'), auth: 'apikey' },
  { id: 'mixpanel', name: 'Mixpanel', desc: 'Product analytics and user behaviour', category: 'Analytics', mcpUrl: 'https://mixpanel.com', logo: getLogo('mixpanel', 'mixpanel.com'), auth: 'apikey' },
  { id: 'segment', name: 'Segment', desc: 'Customer data platform and event tracking', category: 'Analytics', mcpUrl: 'https://segment.com', logo: getLogo('segment', 'segment.com'), auth: 'apikey' },
  { id: 'looker', name: 'Looker', desc: 'Business intelligence and data exploration', category: 'Analytics', mcpUrl: 'https://looker.com', logo: getLogo('looker', 'looker.com'), auth: 'apikey' },
  // Google Workspace
  { id: 'gmail', name: 'Gmail', desc: 'Read, compose and manage your emails', category: 'Google', mcpUrl: 'https://gmailmcp.googleapis.com/mcp/v1', logo: getLogo('gmail', 'gmail.com'), auth: 'google' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Search, read and upload files', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gdrive', 'drive.google.com'), auth: 'google' },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Manage events and schedule meetings', category: 'Google', mcpUrl: 'https://calendarmcp.googleapis.com/mcp/v1', logo: getLogo('gcalendar', 'calendar.google.com'), auth: 'google' },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets and data analysis', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gsheets', 'sheets.google.com'), auth: 'google' },
  { id: 'gdocs', name: 'Google Docs', desc: 'Documents and collaborative writing', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gdocs', 'docs.google.com'), auth: 'google' },
  { id: 'gslides', name: 'Google Slides', desc: 'Presentations and slide decks', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gslides', 'slides.google.com'), auth: 'google' },
  { id: 'gforms', name: 'Google Forms', desc: 'Surveys, quizzes and form responses', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gforms', 'forms.google.com'), auth: 'google' },
  { id: 'gmeet', name: 'Google Meet', desc: 'Video meetings and conferencing', category: 'Google', mcpUrl: 'https://meet.google.com', logo: getLogo('gmeet', 'meet.google.com'), auth: 'google' },
  { id: 'gchat', name: 'Google Chat', desc: 'Team messaging and spaces', category: 'Google', mcpUrl: 'https://chat.google.com', logo: getLogo('gchat', 'chat.google.com'), auth: 'google' },
  { id: 'gtasks', name: 'Google Tasks', desc: 'Task lists and to-dos', category: 'Google', mcpUrl: 'https://tasks.google.com', logo: getLogo('gtasks', 'tasks.google.com'), auth: 'google' },
  { id: 'youtube', name: 'YouTube', desc: 'Video search, transcripts and channel management', category: 'Google', mcpUrl: 'https://youtube.com', logo: getLogo('youtube', 'youtube.com'), auth: 'google' },
  { id: 'ytanalytic', name: 'YouTube Analytics', desc: 'Channel and video performance data', category: 'Google', mcpUrl: 'https://studio.youtube.com', logo: getLogo('ytanalytic', 'youtube.com'), auth: 'google' },
  { id: 'gads', name: 'Google Ads', desc: 'Ad campaigns, keywords and performance', category: 'Google', mcpUrl: 'https://ads.google.com', logo: getLogo('gads', 'ads.google.com'), auth: 'google' },
  { id: 'bigquery', name: 'BigQuery', desc: 'Serverless data warehouse and SQL analytics', category: 'Google', mcpUrl: 'https://cloud.google.com', logo: getLogo('bigquery', 'cloud.google.com'), auth: 'google' },
  { id: 'lookerstudio', name: 'Looker Studio', desc: 'Dashboards and data visualisation', category: 'Google', mcpUrl: 'https://lookerstudio.google.com', logo: getLogo('lookerstudio', 'lookerstudio.google.com'), auth: 'google' },
  // Microsoft 365
  { id: 'outlook', name: 'Outlook', desc: 'Email, calendar and contacts', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('outlook', 'outlook.com'), auth: 'microsoft' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Cloud file storage and sharing', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('onedrive', 'onedrive.com'), auth: 'microsoft' },
  { id: 'teams', name: 'Microsoft Teams', desc: 'Team messaging and video meetings', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('teams', 'teams.microsoft.com'), auth: 'microsoft' },
  { id: 'excel', name: 'Microsoft Excel', desc: 'Spreadsheets and data analysis', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('excel', 'excel.office.com'), auth: 'microsoft' },
  { id: 'word', name: 'Microsoft Word', desc: 'Documents and collaborative writing', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('word', 'word.office.com'), auth: 'microsoft' },
  { id: 'powerpoint', name: 'PowerPoint', desc: 'Presentations and slide decks', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('powerpoint', 'powerpoint.office.com'), auth: 'microsoft' },
  { id: 'sharepoint', name: 'SharePoint', desc: 'Intranet, document management and collaboration', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('sharepoint', 'sharepoint.com'), auth: 'microsoft' },
  { id: 'onenote', name: 'OneNote', desc: 'Notes, notebooks and knowledge capture', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('onenote', 'onenote.com'), auth: 'microsoft' },
  { id: 'mstodo', name: 'Microsoft To Do', desc: 'Tasks, lists and daily planning', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('mstodo', 'todo.microsoft.com'), auth: 'microsoft' },
  { id: 'msplanner', name: 'Microsoft Planner', desc: 'Team task boards and project tracking', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: getLogo('msplanner', 'tasks.office.com'), auth: 'microsoft' },
  // Social
  { id: 'twitter', name: 'X (Twitter)', desc: 'Post, search and manage tweets', category: 'Social', mcpUrl: 'https://api.twitter.com', logo: getLogo('twitter', 'x.com'), auth: 'apikey' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional network and content', category: 'Social', mcpUrl: 'https://api.linkedin.com', logo: getLogo('linkedin', 'linkedin.com'), auth: 'apikey' },
  { id: 'wordpress', name: 'WordPress', desc: 'CMS and blog management', category: 'Social', mcpUrl: 'https://wordpress.com', logo: getLogo('wordpress', 'wordpress.com'), auth: 'apikey' },
  { id: 'instagram', name: 'Instagram', desc: 'Post management and content publishing', category: 'Social', mcpUrl: 'https://graph.facebook.com', logo: getLogo('instagram', 'instagram.com'), auth: 'apikey' },
  { id: 'pinterest', name: 'Pinterest', desc: 'Visual content and pin management', category: 'Social', mcpUrl: 'https://api.pinterest.com', logo: getLogo('pinterest', 'pinterest.com'), auth: 'apikey' },
  { id: 'tiktok', name: 'TikTok', desc: 'Short video creation and analytics', category: 'Social', mcpUrl: 'https://business-api.tiktok.com', logo: getLogo('tiktok', 'tiktok.com'), auth: 'apikey' },
  { id: 'medium', name: 'Medium', desc: 'Publishing articles and blog posts', category: 'Social', mcpUrl: 'https://api.medium.com', logo: getLogo('medium', 'medium.com'), auth: 'apikey' },
  // E-commerce
  { id: 'shopify', name: 'Shopify', desc: 'Products, orders and store management', category: 'E-commerce', mcpUrl: 'https://mcp.shopify.com/mcp', logo: getLogo('shopify', 'shopify.com'), auth: 'oauth_registered' },
  { id: 'woocommerce', name: 'WooCommerce', desc: 'WordPress-based online store management', category: 'E-commerce', mcpUrl: 'https://woocommerce.com', logo: getLogo('woocommerce', 'woocommerce.com'), auth: 'apikey' },
  { id: 'bigcommerce', name: 'BigCommerce', desc: 'Enterprise ecommerce platform', category: 'E-commerce', mcpUrl: 'https://bigcommerce.com', logo: getLogo('bigcommerce', 'bigcommerce.com'), auth: 'apikey' },
  { id: 'etsy', name: 'Etsy', desc: 'Marketplace listings, orders and shop analytics', category: 'E-commerce', mcpUrl: 'https://openapi.etsy.com', logo: getLogo('etsy', 'etsy.com'), auth: 'apikey' },
  { id: 'amazon', name: 'Amazon Seller', desc: 'Product listings, orders and FBA management', category: 'E-commerce', mcpUrl: 'https://sellercentral.amazon.com', logo: getLogo('amazon', 'amazon.com'), auth: 'apikey' },
  { id: 'flipkart', name: 'Flipkart Seller', desc: 'Product listings and seller account management', category: 'E-commerce', mcpUrl: 'https://seller.flipkart.com', logo: getLogo('flipkart', 'flipkart.com'), auth: 'apikey' },
  { id: 'klaviyo', name: 'Klaviyo', desc: 'Email and SMS marketing for ecommerce', category: 'E-commerce', mcpUrl: 'https://a.klaviyo.com', logo: getLogo('klaviyo', 'klaviyo.com'), auth: 'apikey' },
  // AI
  { id: 'openai', name: 'OpenAI', desc: 'GPT models, DALL-E and Whisper', category: 'AI', mcpUrl: 'https://api.openai.com', logo: getLogo('openai', 'openai.com'), auth: 'apikey' },
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude AI models and APIs', category: 'AI', mcpUrl: 'https://api.anthropic.com', logo: getLogo('anthropic', 'anthropic.com'), auth: 'apikey' },
  { id: 'replicate', name: 'Replicate', desc: 'Run AI models in the cloud', category: 'AI', mcpUrl: 'https://mcp.replicate.com/mcp', logo: getLogo('replicate', 'replicate.com'), auth: 'oauth_dcr' },
  { id: 'huggingface', name: 'Hugging Face', desc: 'Open source AI models and datasets', category: 'AI', mcpUrl: 'https://mcp.huggingface.co/mcp', logo: getLogo('huggingface', 'huggingface.co'), auth: 'oauth_dcr' },
  { id: 'perplexity', name: 'Perplexity', desc: 'AI-powered search and research', category: 'AI', mcpUrl: 'https://api.perplexity.ai', logo: getLogo('perplexity', 'perplexity.ai'), auth: 'apikey' },
];

const LS_KEY = 'fi:connected-apps';
const LS_PENDING_KEY = 'fi:pending-provider';

const readLS = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};
const writeLS = (key: string, val: string[]) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const CATEGORIES = ['All', 'Creative', 'Communication', 'Productivity', 'CRM', 'Developer', 'Finance', 'Analytics', 'Google', 'Microsoft', 'Social', 'E-commerce', 'AI'];

const AppIcon = memo(({ logo, name, size = 36 }: { logo: string; name: string; size?: number }) => {
  const isDark = useIsDark();
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
      <img src={logo} alt={name}
        style={{ height: size * 0.6, objectFit: 'contain', width: size * 0.6 }}
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          if (el.parentElement) {
            el.parentElement.innerHTML = `<span style="font-size:${size * 0.28}px;font-weight:500;opacity:0.4">${name.slice(0, 2).toUpperCase()}</span>`;
          }
        }}
      />
    </div>
  );
});
AppIcon.displayName = 'AppIcon';

const ConnectPage = memo(() => {
  const isDark = useIsDark();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [connected, setConnected] = useState<string[]>(() => readLS(LS_KEY));
  const [connecting, setConnecting] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<McpApp | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [failureBanner, setFailureBanner] = useState<string | null>(null);
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

  // Auto-dismiss banners after 4 seconds
  useEffect(() => {
    if (!successBanner && !failureBanner) return;
    const timer = setTimeout(() => {
      setSuccessBanner(null);
      setFailureBanner(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [successBanner, failureBanner]);

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

  // On mount: restore Google/Microsoft connection state from Better Auth session
  useEffect(() => {
    const pending = localStorage.getItem(LS_PENDING_KEY) as 'google' | 'microsoft' | null;
    if (pending) localStorage.removeItem(LS_PENDING_KEY);

    listAccounts()
      .then(result => {
        const accounts = result.data ?? [];
        const hasGoogle = accounts.some(a => a.providerId === 'google');
        const hasMicrosoft = accounts.some(
          a => a.providerId === 'microsoft' || a.providerId === 'microsoft-entra-id',
        );
        if (hasGoogle) markConnectedBulk(GOOGLE_APP_IDS);
        if (hasMicrosoft) markConnectedBulk(MICROSOFT_APP_IDS);
        if (pending === 'google' && hasGoogle) {
          setSuccessBanner('Google account connected. All Google Workspace apps are now available.');
        } else if (pending === 'microsoft' && hasMicrosoft) {
          setSuccessBanner('Microsoft account connected. All Microsoft 365 apps are now available.');
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(async (app: McpApp) => {
    if (app.auth === 'coming_soon') return;

    if (app.auth === 'google') {
      setConnecting(app.id);
      localStorage.setItem(LS_PENDING_KEY, 'google');
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await signIn.social({ callbackURL: '/connect', provider: 'google' as any });
      } catch {
        localStorage.removeItem(LS_PENDING_KEY);
        setConnecting(null);
      }
      return;
    }

    if (app.auth === 'microsoft') {
      setConnecting(app.id);
      localStorage.setItem(LS_PENDING_KEY, 'microsoft');
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await signIn.social({ callbackURL: '/connect', provider: 'microsoft' as any });
      } catch {
        localStorage.removeItem(LS_PENDING_KEY);
        setConnecting(null);
      }
      return;
    }

    if (app.auth === 'oauth_registered' || app.auth === 'oauth_dcr') {
      setInfoModal(app);
      return;
    }

    // apikey
    setApiKeyModal(app.id);
    setApiKeyValue('');
  }, []);

  const handleInfoConfirm = useCallback(async () => {
    if (!infoModal) return;
    const app = infoModal;
    setInfoModal(null);

    if (app.auth === 'oauth_registered') {
      const oauthUrl = OAUTH_URLS[app.id];
      if (!oauthUrl) return;
      setConnecting(app.id);
      const openedAt = Date.now();
      const tab = window.open(oauthUrl, '_blank', 'width=600,height=700');

      if (!tab) {
        setConnecting(null);
        setFailureBanner('Popup was blocked. Please allow popups and try again.');
        return;
      }

      // Poll until the tab closes, then evaluate success by elapsed time
      const poll = setInterval(() => {
        if (!tab.closed) return;
        clearInterval(poll);
        setConnecting(null);
        if (Date.now() - openedAt > 3000) {
          markConnected(app.id);
          setSuccessBanner(`Connected to ${app.name} successfully`);
        } else {
          setFailureBanner('Connection cancelled');
        }
      }, 500);
    } else if (app.auth === 'oauth_dcr') {
      setConnecting(app.id);
      try {
        await installCustomPlugin({
          customParams: {
            description: app.desc,
            mcp: { auth: { type: 'none' }, type: 'http', url: app.mcpUrl },
          },
          identifier: `connect-${app.id}`,
          type: 'customPlugin',
        });
        markConnected(app.id);
        setSuccessBanner(`Connected to ${app.name} successfully`);
      } catch {
        setFailureBanner(`Failed to connect to ${app.name}. Please try again.`);
      } finally {
        setConnecting(null);
      }
    }
  }, [infoModal, installCustomPlugin, markConnected]);

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
        identifier: `connect-${app.id}`,
        type: 'customPlugin',
      });
      markConnected(apiKeyModal);
      setSuccessBanner(`Connected to ${app.name} successfully`);
      setApiKeyModal(null);
      setApiKeyValue('');
    } catch {
      setFailureBanner('Failed to save API key. Please check it and try again.');
    } finally {
      setSavingKey(false);
    }
  }, [apiKeyModal, apiKeyValue, installCustomPlugin, markConnected]);

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

  const modalApp = MCP_APPS.find(a => a.id === apiKeyModal);

  return (
    <div style={{ background: bg, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* Header */}
      <div style={{ background: isDark ? '#1e1e1d' : '#ffffff', borderBottom: `0.5px solid ${border}`, flexShrink: 0, padding: '20px 32px 16px' }}>
        <div style={{ alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: text, fontSize: 20, fontWeight: 500, margin: 0 }}>Connect</h1>
            <p style={{ color: textSub, fontSize: 13, margin: '4px 0 0' }}>
              Connect Fi to your apps. OAuth apps connect with a single login — no API keys needed.
            </p>
          </div>
          <div style={{ color: textTertiary, fontSize: 12 }}>{MCP_APPS.length}+ integrations</div>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginTop: 16 }}>
          <div style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 10, display: 'flex', flexShrink: 0, gap: 8, padding: '7px 12px', width: 260 }}>
            <Search size={14} style={{ color: textTertiary, flexShrink: 0 }} />
            <input
              placeholder="Search connectors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 13, outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: textTertiary, cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flex: 1, gap: 6, overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ background: activeCategory === cat ? text : 'transparent', border: `0.5px solid ${activeCategory === cat ? 'transparent' : border}`, borderRadius: 20, color: activeCategory === cat ? bg : textSub, cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 14px', transition: 'all 0.15s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px 40px' }}>

        {/* Success banner */}
        {successBanner && (
          <div style={{ alignItems: 'center', background: isDark ? 'rgba(74,222,128,0.1)' : 'rgba(22,163,74,0.08)', border: `0.5px solid ${isDark ? 'rgba(74,222,128,0.3)' : 'rgba(22,163,74,0.25)'}`, borderRadius: 10, color: isDark ? '#4ade80' : '#15803d', display: 'flex', fontSize: 13, gap: 8, justifyContent: 'space-between', marginBottom: 16, padding: '12px 16px' }}>
            <span style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <Check size={14} />
              {successBanner}
            </span>
            <button onClick={() => setSuccessBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Failure banner */}
        {failureBanner && (
          <div style={{ alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `0.5px solid ${border}`, borderRadius: 10, color: textSub, display: 'flex', fontSize: 13, gap: 8, justifyContent: 'space-between', marginBottom: 16, padding: '12px 16px' }}>
            <span style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} />
              {failureBanner}
            </span>
            <button onClick={() => setFailureBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        )}

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
              {connectedApps.map(app => (
                <div key={app.id} style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.2)'}`, borderRadius: 12, display: 'flex', gap: 12, padding: '12px 14px' }}>
                  <AppIcon logo={app.logo} name={app.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                      <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                      <Check size={12} style={{ color: isDark ? '#4ade80' : '#16a34a' }} />
                    </div>
                    <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  </div>
                  <button onClick={() => handleDisconnect(app.id)}
                    style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 11, flexShrink: 0, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available apps grouped by category */}
        {Object.entries(groupedByCategory).map(([category, apps]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>
              {category}
            </div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {apps.map(app => {
                const isConnecting = connecting === app.id;
                const isComingSoon = app.auth === 'coming_soon';
                return (
                  <div key={app.id}
                    onClick={() => { if (!isConnecting && !isComingSoon) void handleConnect(app); }}
                    style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, cursor: isComingSoon ? 'default' : isConnecting ? 'wait' : 'pointer', display: 'flex', gap: 12, opacity: isComingSoon ? 0.65 : 1, padding: '12px 14px', transition: 'border-color 0.1s' }}
                    onMouseEnter={e => { if (!isConnecting && !isComingSoon) e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = border; }}>
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
                      <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isConnecting ? 'Connecting...' : app.desc}
                      </div>
                    </div>
                    {isComingSoon ? (
                      <span style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: `0.5px solid ${border}`, borderRadius: 8, color: textTertiary, flexShrink: 0, fontSize: 11, padding: '5px 10px', whiteSpace: 'nowrap' }}>
                        Coming Soon
                      </span>
                    ) : (
                      <button
                        disabled={isConnecting}
                        onClick={e => { e.stopPropagation(); if (!isConnecting) void handleConnect(app); }}
                        style={{ background: text, border: 'none', borderRadius: 8, color: bg, cursor: isConnecting ? 'wait' : 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 500, opacity: isConnecting ? 0.5 : 1, padding: '5px 14px', whiteSpace: 'nowrap' }}>
                        {isConnecting ? '...' : 'Connect'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredUnconnected.length === 0 && connectedApps.length === 0 && (
          <div style={{ color: textSub, fontSize: 13, padding: '60px 0', textAlign: 'center' }}>
            No connectors found for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Info modal (Grok-style) — for oauth_registered and oauth_dcr */}
      {infoModal && (
        <div
          onClick={() => setInfoModal(null)}
          style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 18, boxShadow: '0 12px 48px rgba(0,0,0,0.35)', maxWidth: 420, padding: '28px 28px 24px', width: '90%' }}>

            {/* Logo + name */}
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
              <AppIcon logo={infoModal.logo} name={infoModal.name} size={52} />
              <div style={{ color: text, fontSize: 17, fontWeight: 600, marginTop: 12 }}>{infoModal.name}</div>
              <div style={{ color: textSub, fontSize: 12, marginTop: 3 }}>{infoModal.category}</div>
            </div>

            {/* Description */}
            <p style={{ color: textSub, fontSize: 13, lineHeight: 1.55, margin: '0 0 16px' }}>{infoModal.desc}</p>

            {/* Server URL */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', marginBottom: 5, textTransform: 'uppercase' }}>Server URL</div>
              <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, fontFamily: 'monospace', fontSize: 12, overflowX: 'auto', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                {infoModal.mcpUrl}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ background: isDark ? 'rgba(234,179,8,0.08)' : 'rgba(234,179,8,0.07)', border: `0.5px solid ${isDark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.25)'}`, borderRadius: 8, color: isDark ? 'rgba(234,179,8,0.85)' : '#92400e', fontSize: 12, lineHeight: 1.5, marginBottom: 20, padding: '10px 12px' }}>
              Third-party connectors are not built or maintained by Fi. Review permissions before connecting.
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setInfoModal(null)}
                style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 13, padding: '8px 18px' }}>
                Cancel
              </button>
              <button onClick={() => void handleInfoConfirm()}
                style={{ background: text, border: 'none', borderRadius: 8, color: bg, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '8px 18px' }}>
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key modal */}
      {apiKeyModal && modalApp && (
        <div
          onClick={() => setApiKeyModal(null)}
          style={{ alignItems: 'center', background: 'rgba(0,0,0,0.5)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: 400, padding: '24px', width: '90%' }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 20 }}>
              <AppIcon logo={modalApp.logo} name={modalApp.name} />
              <div>
                <div style={{ color: text, fontSize: 15, fontWeight: 500 }}>Connect {modalApp.name}</div>
                <div style={{ color: textSub, fontSize: 12, marginTop: 2 }}>Enter your API key to connect</div>
              </div>
            </div>
            <div style={{ color: textSub, fontSize: 12, marginBottom: 8 }}>
              Get your API key from{' '}
              <a href={modalApp.mcpUrl} target="_blank" rel="noreferrer" style={{ color: text }}>{modalApp.name} dashboard</a>
            </div>
            <input
              value={apiKeyValue}
              onChange={e => setApiKeyValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSaveApiKey(); }}
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
