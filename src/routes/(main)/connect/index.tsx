'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { Search, X, Check, Key, Plus } from 'lucide-react';
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

// All Google app IDs — marked connected when user connects Google account
const GOOGLE_APP_IDS = ['gmail','gdrive','gcalendar','gsheets','gdocs','gslides','gforms','gmeet','gchat','gtasks','youtube','ytanalytic','gads','googleanalytics','bigquery','lookerstudio'];
// All Microsoft app IDs — marked connected when user connects Microsoft account
const MICROSOFT_APP_IDS = ['outlook','onedrive','teams','excel','word','powerpoint','sharepoint','onenote','mstodo','msplanner'];

const MCP_APPS = [
  // Creative & Media
  { id: 'higgsfield', name: 'Higgsfield', desc: 'AI video generation — Sora, Veo3, Kling, 30+ models', category: 'Creative', url: 'https://mcp.higgsfield.ai/mcp', logo: getLogo('higgsfield', 'higgsfield.ai'), auth: 'oauth' },
  { id: 'canva', name: 'Canva', desc: 'Create designs, presentations and visual content', category: 'Creative', url: 'https://mcp.canva.com/mcp', logo: getLogo('canva', 'canva.com'), auth: 'oauth' },
  { id: 'figma', name: 'Figma', desc: 'Design files, components and prototypes', category: 'Creative', url: 'https://mcp.figma.com/mcp', logo: getLogo('figma', 'figma.com'), auth: 'oauth' },
  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'AI voice generation and text to speech', category: 'Creative', url: 'https://elevenlabs.io', logo: getLogo('elevenlabs', 'elevenlabs.io'), auth: 'apikey' },
  { id: 'runway', name: 'Runway', desc: 'AI video and image generation tools', category: 'Creative', url: 'https://runwayml.com', logo: getLogo('runway', 'runwayml.com'), auth: 'apikey' },
  { id: 'adobe', name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere and more', category: 'Creative', url: 'https://adobe.com', logo: getLogo('adobe', 'adobe.com'), auth: 'apikey' },
  // Communication
  { id: 'slack', name: 'Slack', desc: 'Send messages, search conversations, manage channels', category: 'Communication', url: 'https://mcp.slack.com/mcp', logo: getLogo('slack', 'slack.com'), auth: 'oauth' },
  { id: 'discord', name: 'Discord', desc: 'Messaging, servers and community management', category: 'Communication', url: 'https://discord.com', logo: getLogo('discord', 'discord.com'), auth: 'apikey' },
  { id: 'telegram', name: 'Telegram', desc: 'Messaging and bot automation', category: 'Communication', url: 'https://telegram.org', logo: getLogo('telegram', 'telegram.org'), auth: 'apikey' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Business messaging and customer engagement', category: 'Communication', url: 'https://business.whatsapp.com', logo: getLogo('whatsapp', 'business.whatsapp.com'), auth: 'apikey' },
  { id: 'zoom', name: 'Zoom', desc: 'Video meetings, webinars and recordings', category: 'Communication', url: 'https://zoom.us', logo: getLogo('zoom', 'zoom.us'), auth: 'apikey' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS, voice calls and messaging APIs', category: 'Communication', url: 'https://twilio.com', logo: getLogo('twilio', 'twilio.com'), auth: 'apikey' },
  // Productivity
  { id: 'notion', name: 'Notion', desc: 'Read and write pages, databases and workspaces', category: 'Productivity', url: 'https://mcp.notion.com/mcp', logo: getLogo('notion', 'notion.so'), auth: 'oauth' },
  { id: 'asana', name: 'Asana', desc: 'Projects, tasks and team workflow management', category: 'Productivity', url: 'https://mcp.asana.com/mcp', logo: getLogo('asana', 'asana.com'), auth: 'oauth' },
  { id: 'linear', name: 'Linear', desc: 'Issues, projects, cycles and team management', category: 'Productivity', url: 'https://mcp.linear.app/mcp', logo: getLogo('linear', 'linear.app'), auth: 'oauth' },
  { id: 'monday', name: 'Monday.com', desc: 'Boards, items and project tracking', category: 'Productivity', url: 'https://mcp.monday.com/mcp', logo: getLogo('monday', 'monday.com'), auth: 'oauth' },
  { id: 'clickup', name: 'ClickUp', desc: 'Tasks, docs and project collaboration', category: 'Productivity', url: 'https://clickup.com', logo: getLogo('clickup', 'clickup.com'), auth: 'apikey' },
  { id: 'box', name: 'Box', desc: 'Enterprise file storage, metadata and sharing', category: 'Productivity', url: 'https://mcp.box.com/mcp', logo: getLogo('box', 'box.com'), auth: 'oauth' },
  { id: 'dropbox', name: 'Dropbox', desc: 'Cloud file storage and collaboration', category: 'Productivity', url: 'https://dropbox.com', logo: getLogo('dropbox', 'dropbox.com'), auth: 'apikey' },
  { id: 'airtable', name: 'Airtable', desc: 'Database, spreadsheet and workflow platform', category: 'Productivity', url: 'https://airtable.com', logo: getLogo('airtable', 'airtable.com'), auth: 'apikey' },
  { id: 'todoist', name: 'Todoist', desc: 'Task management and to-do lists', category: 'Productivity', url: 'https://todoist.com', logo: getLogo('todoist', 'todoist.com'), auth: 'apikey' },
  { id: 'trello', name: 'Trello', desc: 'Visual boards and card-based task tracking', category: 'Productivity', url: 'https://trello.com', logo: getLogo('trello', 'trello.com'), auth: 'apikey' },
  // CRM & Sales
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM contacts, deals and marketing pipelines', category: 'CRM', url: 'https://mcp.hubspot.com', logo: getLogo('hubspot', 'hubspot.com'), auth: 'oauth' },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM leads, opportunities and contacts', category: 'CRM', url: 'https://mcp.salesforce.com/mcp', logo: getLogo('salesforce', 'salesforce.com'), auth: 'oauth' },
  { id: 'clay', name: 'Clay', desc: 'Data enrichment, lead lists and CRM sync', category: 'CRM', url: 'https://mcp.clay.com/mcp', logo: getLogo('clay', 'clay.run'), auth: 'oauth' },
  { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets and interactions', category: 'CRM', url: 'https://zendesk.com', logo: getLogo('zendesk', 'zendesk.com'), auth: 'apikey' },
  { id: 'intercom', name: 'Intercom', desc: 'Customer messaging and support platform', category: 'CRM', url: 'https://intercom.com', logo: getLogo('intercom', 'intercom.com'), auth: 'apikey' },
  { id: 'pipedrive', name: 'Pipedrive', desc: 'Sales pipeline and deal management', category: 'CRM', url: 'https://pipedrive.com', logo: getLogo('pipedrive', 'pipedrive.com'), auth: 'apikey' },
  // Developer Tools
  { id: 'github', name: 'GitHub', desc: 'Repositories, issues, PRs and workflows', category: 'Developer', url: 'https://api.githubcopilot.com/mcp/', logo: getLogo('github', 'github.com'), auth: 'oauth' },
  { id: 'gitlab', name: 'GitLab', desc: 'Repository, CI/CD and DevOps platform', category: 'Developer', url: 'https://gitlab.com', logo: getLogo('gitlab', 'gitlab.com'), auth: 'apikey' },
  { id: 'vercel', name: 'Vercel', desc: 'Deployments, logs and environments', category: 'Developer', url: 'https://mcp.vercel.com', logo: getLogo('vercel', 'vercel.com'), auth: 'oauth' },
  { id: 'sentry', name: 'Sentry', desc: 'Error tracking, issues and performance', category: 'Developer', url: 'https://mcp.sentry.dev/mcp', logo: getLogo('sentry', 'sentry.io'), auth: 'oauth' },
  { id: 'supabase', name: 'Supabase', desc: 'Database, auth, storage and realtime', category: 'Developer', url: 'https://mcp.supabase.com/mcp', logo: getLogo('supabase', 'supabase.com'), auth: 'oauth' },
  { id: 'cloudflare', name: 'Cloudflare', desc: 'Workers, KV storage and DNS management', category: 'Developer', url: 'https://mcp.cloudflare.com/mcp', logo: getLogo('cloudflare', 'cloudflare.com'), auth: 'oauth' },
  { id: 'neon', name: 'Neon', desc: 'Serverless Postgres with branching', category: 'Developer', url: 'https://mcp.neon.tech/mcp', logo: getLogo('neon', 'neon.tech'), auth: 'oauth' },
  { id: 'atlassian', name: 'Jira & Confluence', desc: 'Issues, tickets and team documentation', category: 'Developer', url: 'https://mcp.atlassian.com/v1/mcp', logo: getLogo('atlassian', 'atlassian.com'), auth: 'oauth' },
  { id: 'firebase', name: 'Firebase', desc: 'App backend, Firestore, Auth and hosting', category: 'Developer', url: 'https://firebase.google.com', logo: getLogo('firebase', 'firebase.google.com'), auth: 'apikey' },
  { id: 'postman', name: 'Postman', desc: 'API development and testing platform', category: 'Developer', url: 'https://postman.com', logo: getLogo('postman', 'postman.com'), auth: 'apikey' },
  { id: 'aws', name: 'AWS', desc: 'Cloud infrastructure and services', category: 'Developer', url: 'https://aws.amazon.com', logo: getLogo('aws', 'aws.amazon.com'), auth: 'apikey' },
  { id: 'datadog', name: 'Datadog', desc: 'Monitoring, metrics and observability', category: 'Developer', url: 'https://datadoghq.com', logo: getLogo('datadog', 'datadoghq.com'), auth: 'apikey' },
  { id: 'pagerduty', name: 'PagerDuty', desc: 'Incident management and on-call alerting', category: 'Developer', url: 'https://pagerduty.com', logo: getLogo('pagerduty', 'pagerduty.com'), auth: 'apikey' },
  // Finance & Payments
  { id: 'stripe', name: 'Stripe', desc: 'Payments, subscriptions and invoices', category: 'Finance', url: 'https://mcp.stripe.com', logo: getLogo('stripe', 'stripe.com'), auth: 'oauth' },
  { id: 'paypal', name: 'PayPal', desc: 'Payments, invoices and transactions', category: 'Finance', url: 'https://mcp.paypal.com/http', logo: getLogo('paypal', 'paypal.com'), auth: 'oauth' },
  { id: 'cashfree', name: 'Cashfree', desc: 'Payment gateway and payouts (India)', category: 'Finance', url: 'https://mcp.cashfree.com/mcp', logo: getLogo('cashfree', 'cashfree.com'), auth: 'oauth' },
  { id: 'razorpay', name: 'Razorpay', desc: 'Payment gateway for India', category: 'Finance', url: 'https://razorpay.com', logo: getLogo('razorpay', 'razorpay.com'), auth: 'apikey' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting and financial management', category: 'Finance', url: 'https://quickbooks.intuit.com', logo: getLogo('quickbooks', 'quickbooks.intuit.com'), auth: 'apikey' },
  { id: 'xero', name: 'Xero', desc: 'Cloud accounting and bookkeeping', category: 'Finance', url: 'https://xero.com', logo: getLogo('xero', 'xero.com'), auth: 'apikey' },
  { id: 'plaid', name: 'Plaid', desc: 'Bank account connections and financial data', category: 'Finance', url: 'https://plaid.com', logo: getLogo('plaid', 'plaid.com'), auth: 'apikey' },
  // Analytics
  { id: 'amplitude', name: 'Amplitude', desc: 'Product analytics, user journeys and A/B testing', category: 'Analytics', url: 'https://mcp.amplitude.com/mcp', logo: getLogo('amplitude', 'amplitude.com'), auth: 'oauth' },
  { id: 'hex', name: 'Hex', desc: 'Data notebooks, analytics and interactive charts', category: 'Analytics', url: 'https://mcp.hex.tech/mcp', logo: getLogo('hex', 'hex.tech'), auth: 'oauth' },
  { id: 'mixpanel', name: 'Mixpanel', desc: 'Product analytics and user behaviour', category: 'Analytics', url: 'https://mixpanel.com', logo: getLogo('mixpanel', 'mixpanel.com'), auth: 'apikey' },
  { id: 'googleanalytics', name: 'Google Analytics', desc: 'Web analytics and reporting', category: 'Analytics', url: 'https://analytics.google.com', logo: getLogo('googleanalytics', 'analytics.google.com'), auth: 'apikey' },
  { id: 'segment', name: 'Segment', desc: 'Customer data platform and event tracking', category: 'Analytics', url: 'https://segment.com', logo: getLogo('segment', 'segment.com'), auth: 'apikey' },
  { id: 'looker', name: 'Looker', desc: 'Business intelligence and data exploration', category: 'Analytics', url: 'https://looker.com', logo: getLogo('looker', 'looker.com'), auth: 'apikey' },
  // Google Workspace
  { id: 'gmail', name: 'Gmail', desc: 'Read, compose and manage your emails', category: 'Google', url: 'https://gmailmcp.googleapis.com/mcp/v1', logo: getLogo('gmail', 'gmail.com'), auth: 'google' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Search, read and upload files', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gdrive', 'drive.google.com'), auth: 'google' },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Manage events and schedule meetings', category: 'Google', url: 'https://calendarmcp.googleapis.com/mcp/v1', logo: getLogo('gcalendar', 'calendar.google.com'), auth: 'google' },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets and data analysis', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gsheets', 'sheets.google.com'), auth: 'google' },
  { id: 'gdocs', name: 'Google Docs', desc: 'Documents and collaborative writing', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gdocs', 'docs.google.com'), auth: 'google' },
  { id: 'gslides', name: 'Google Slides', desc: 'Presentations and slide decks', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gslides', 'slides.google.com'), auth: 'google' },
  { id: 'gforms', name: 'Google Forms', desc: 'Surveys, quizzes and form responses', category: 'Google', url: 'https://drivemcp.googleapis.com/mcp/v1', logo: getLogo('gforms', 'forms.google.com'), auth: 'google' },
  { id: 'gmeet', name: 'Google Meet', desc: 'Video meetings and conferencing', category: 'Google', url: 'https://meet.google.com', logo: getLogo('gmeet', 'meet.google.com'), auth: 'google' },
  { id: 'gchat', name: 'Google Chat', desc: 'Team messaging and spaces', category: 'Google', url: 'https://chat.google.com', logo: getLogo('gchat', 'chat.google.com'), auth: 'google' },
  { id: 'gtasks', name: 'Google Tasks', desc: 'Task lists and to-dos', category: 'Google', url: 'https://tasks.google.com', logo: getLogo('gtasks', 'tasks.google.com'), auth: 'google' },
  { id: 'youtube', name: 'YouTube', desc: 'Video search, transcripts and channel management', category: 'Google', url: 'https://youtube.com', logo: getLogo('youtube', 'youtube.com'), auth: 'google' },
  { id: 'ytanalytic', name: 'YouTube Analytics', desc: 'Channel and video performance data', category: 'Google', url: 'https://studio.youtube.com', logo: getLogo('ytanalytic', 'studio.youtube.com'), auth: 'google' },
  { id: 'gads', name: 'Google Ads', desc: 'Ad campaigns, keywords and performance', category: 'Google', url: 'https://ads.google.com', logo: getLogo('gads', 'ads.google.com'), auth: 'google' },
  { id: 'bigquery', name: 'BigQuery', desc: 'Serverless data warehouse and SQL analytics', category: 'Google', url: 'https://cloud.google.com', logo: getLogo('bigquery', 'cloud.google.com'), auth: 'google' },
  { id: 'lookerstudio', name: 'Looker Studio', desc: 'Dashboards and data visualisation', category: 'Google', url: 'https://lookerstudio.google.com', logo: getLogo('lookerstudio', 'lookerstudio.google.com'), auth: 'google' },
  // Microsoft 365
  { id: 'outlook', name: 'Outlook', desc: 'Email, calendar and contacts', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('outlook', 'outlook.com'), auth: 'microsoft' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Cloud file storage and sharing', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('onedrive', 'onedrive.com'), auth: 'microsoft' },
  { id: 'teams', name: 'Microsoft Teams', desc: 'Team messaging and video meetings', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('teams', 'teams.microsoft.com'), auth: 'microsoft' },
  { id: 'excel', name: 'Microsoft Excel', desc: 'Spreadsheets and data analysis', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('excel', 'excel.office.com'), auth: 'microsoft' },
  { id: 'word', name: 'Microsoft Word', desc: 'Documents and collaborative writing', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('word', 'word.office.com'), auth: 'microsoft' },
  { id: 'powerpoint', name: 'PowerPoint', desc: 'Presentations and slide decks', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('powerpoint', 'powerpoint.office.com'), auth: 'microsoft' },
  { id: 'sharepoint', name: 'SharePoint', desc: 'Intranet, document management and collaboration', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('sharepoint', 'sharepoint.com'), auth: 'microsoft' },
  { id: 'onenote', name: 'OneNote', desc: 'Notes, notebooks and knowledge capture', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('onenote', 'onenote.com'), auth: 'microsoft' },
  { id: 'mstodo', name: 'Microsoft To Do', desc: 'Tasks, lists and daily planning', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('mstodo', 'todo.microsoft.com'), auth: 'microsoft' },
  { id: 'msplanner', name: 'Microsoft Planner', desc: 'Team task boards and project tracking', category: 'Microsoft', url: 'https://agent365.svc.cloud.microsoft', logo: getLogo('msplanner', 'tasks.office.com'), auth: 'microsoft' },
  // Social & Content
  { id: 'twitter', name: 'X (Twitter)', desc: 'Post, search and manage tweets', category: 'Social', url: 'https://x.com', logo: getLogo('twitter', 'x.com'), auth: 'apikey' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional network and content', category: 'Social', url: 'https://linkedin.com', logo: getLogo('linkedin', 'linkedin.com'), auth: 'apikey' },
  { id: 'wordpress', name: 'WordPress', desc: 'CMS and blog management', category: 'Social', url: 'https://wordpress.com', logo: getLogo('wordpress', 'wordpress.com'), auth: 'apikey' },
  { id: 'instagram', name: 'Instagram', desc: 'Post management and content publishing', category: 'Social', url: 'https://instagram.com', logo: getLogo('instagram', 'instagram.com'), auth: 'apikey' },
  { id: 'pinterest', name: 'Pinterest', desc: 'Visual content and pin management', category: 'Social', url: 'https://pinterest.com', logo: getLogo('pinterest', 'pinterest.com'), auth: 'apikey' },
  { id: 'tiktok', name: 'TikTok', desc: 'Short video creation and analytics', category: 'Social', url: 'https://tiktok.com', logo: getLogo('tiktok', 'tiktok.com'), auth: 'apikey' },
  { id: 'medium', name: 'Medium', desc: 'Publishing articles and blog posts', category: 'Social', url: 'https://medium.com', logo: getLogo('medium', 'medium.com'), auth: 'apikey' },
  // E-commerce
  { id: 'shopify', name: 'Shopify', desc: 'Products, orders and store management', category: 'E-commerce', url: 'https://mcp.shopify.com/mcp', logo: getLogo('shopify', 'shopify.com'), auth: 'oauth' },
  { id: 'woocommerce', name: 'WooCommerce', desc: 'WordPress-based online store management', category: 'E-commerce', url: 'https://woocommerce.com', logo: getLogo('woocommerce', 'woocommerce.com'), auth: 'apikey' },
  { id: 'bigcommerce', name: 'BigCommerce', desc: 'Enterprise ecommerce platform', category: 'E-commerce', url: 'https://bigcommerce.com', logo: getLogo('bigcommerce', 'bigcommerce.com'), auth: 'apikey' },
  { id: 'etsy', name: 'Etsy', desc: 'Marketplace listings, orders and shop analytics', category: 'E-commerce', url: 'https://etsy.com', logo: getLogo('etsy', 'etsy.com'), auth: 'apikey' },
  { id: 'amazon', name: 'Amazon Seller', desc: 'Product listings, orders and FBA management', category: 'E-commerce', url: 'https://sellercentral.amazon.com', logo: getLogo('amazon', 'amazon.com'), auth: 'apikey' },
  { id: 'flipkart', name: 'Flipkart Seller', desc: 'Product listings and seller account management', category: 'E-commerce', url: 'https://seller.flipkart.com', logo: getLogo('flipkart', 'flipkart.com'), auth: 'apikey' },
  { id: 'klaviyo', name: 'Klaviyo', desc: 'Email and SMS marketing for ecommerce', category: 'E-commerce', url: 'https://klaviyo.com', logo: getLogo('klaviyo', 'klaviyo.com'), auth: 'apikey' },
  // AI Tools
  { id: 'openai', name: 'OpenAI', desc: 'GPT models, DALL-E and Whisper', category: 'AI', url: 'https://openai.com', logo: getLogo('openai', 'openai.com'), auth: 'apikey' },
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude AI models and APIs', category: 'AI', url: 'https://anthropic.com', logo: getLogo('anthropic', 'anthropic.com'), auth: 'apikey' },
  { id: 'stability', name: 'Stability AI', desc: 'Image generation models', category: 'AI', url: 'https://stability.ai', logo: getLogo('stability', 'stability.ai'), auth: 'apikey' },
  { id: 'replicate', name: 'Replicate', desc: 'Run AI models in the cloud', category: 'AI', url: 'https://replicate.com', logo: getLogo('replicate', 'replicate.com'), auth: 'apikey' },
  { id: 'huggingface', name: 'Hugging Face', desc: 'Open source AI models and datasets', category: 'AI', url: 'https://huggingface.co', logo: getLogo('huggingface', 'huggingface.co'), auth: 'apikey' },
  { id: 'perplexity', name: 'Perplexity', desc: 'AI-powered search and research', category: 'AI', url: 'https://perplexity.ai', logo: getLogo('perplexity', 'perplexity.ai'), auth: 'apikey' },
];

const LS_KEY = 'fi:connected-apps';
const LS_ADDED_KEY = 'fi:added-apps';
const LS_PENDING_KEY = 'fi:pending-provider';

type AppAuth = 'oauth' | 'google' | 'microsoft' | 'apikey';
interface McpApp { auth: AppAuth; category: string; desc: string; id: string; logo: string; name: string; url: string }

const CATEGORIES = ['All', 'Creative', 'Communication', 'Productivity', 'CRM', 'Developer', 'Finance', 'Analytics', 'Google', 'Microsoft', 'Social', 'E-commerce', 'AI'];

const readLS = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

const writeLS = (key: string, val: string[]) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

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
  const [connected, setConnected] = useState<string[]>(() => readLS(LS_KEY));
  const [added, setAdded] = useState<string[]>(() => readLS(LS_ADDED_KEY));
  const [connecting, setConnecting] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
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

  // Bulk-mark connected IDs and persist
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

  // On mount: check linked accounts to restore connected state, and detect OAuth callback
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
          setSuccessBanner('Google account connected successfully. All Google apps are now available.');
        } else if (pending === 'microsoft' && hasMicrosoft) {
          setSuccessBanner('Microsoft account connected successfully. All Microsoft apps are now available.');
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async (app: McpApp) => {
    if (app.auth === 'google') {
      setConnecting(app.id);
      localStorage.setItem(LS_PENDING_KEY, 'google');
      try {
        // Full-page redirect to Google OAuth, returns to /connect on success
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await signIn.social({ callbackURL: '/connect', provider: 'google' as any });
      } catch (e) {
        localStorage.removeItem(LS_PENDING_KEY);
        console.error('Google sign-in error:', e);
        setConnecting(null);
      }
      return; // page will redirect; no further logic needed
    }

    if (app.auth === 'microsoft') {
      setConnecting(app.id);
      localStorage.setItem(LS_PENDING_KEY, 'microsoft');
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await signIn.social({ callbackURL: '/connect', provider: 'microsoft' as any });
      } catch (e) {
        localStorage.removeItem(LS_PENDING_KEY);
        console.error('Microsoft sign-in error:', e);
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
            mcp: { auth: { type: 'none' }, type: 'http', url: app.url },
          },
          identifier: `connect-${app.id}`,
          type: 'customPlugin',
        });
        setAdded(prev => {
          const next = prev.includes(app.id) ? prev : [...prev, app.id];
          writeLS(LS_ADDED_KEY, next);
          return next;
        });
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

  const handleSaveApiKey = async () => {
    if (!apiKeyModal || !apiKeyValue.trim()) return;
    const app = apps.find(a => a.id === apiKeyModal);
    if (!app) return;
    setSavingKey(true);
    try {
      await installCustomPlugin({
        customParams: {
          description: app.desc,
          mcp: { auth: { token: apiKeyValue.trim(), type: 'bearer' }, type: 'http', url: app.url },
        },
        identifier: `connect-${app.id}`,
        type: 'customPlugin',
      });
      markConnected(apiKeyModal);
      setApiKeyModal(null);
      setApiKeyValue('');
    } catch (e) {
      console.error('API key save error:', e);
    } finally {
      setSavingKey(false);
    }
  };

  const filtered = apps.filter(app => {
    const matchSearch = !search.trim() ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.desc.toLowerCase().includes(search.toLowerCase()) ||
      app.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || app.category === activeCategory;
    return matchSearch && matchCat;
  });

  const connectedApps = apps.filter(a => connected.includes(a.id));
  const pendingApps = apps.filter(a => added.includes(a.id) && !connected.includes(a.id));
  const availableFiltered = filtered.filter(a => !connected.includes(a.id) && !added.includes(a.id));

  const groupedByCategory: Record<string, McpApp[]> = {};
  availableFiltered.forEach(app => {
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
        <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginTop: 16 }}>
          <div style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${border}`, borderRadius: 10, display: 'flex', flexShrink: 0, gap: 8, padding: '7px 12px', width: 280 }}>
            <Search size={14} style={{ color: textTertiary, flexShrink: 0 }} />
            <input placeholder="Search connectors..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: text, flex: 1, fontSize: 13, outline: 'none' }} />
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
          <div style={{ alignItems: 'center', background: isDark ? 'rgba(74,222,128,0.1)' : 'rgba(22,163,74,0.08)', border: `0.5px solid ${isDark ? 'rgba(74,222,128,0.3)' : 'rgba(22,163,74,0.25)'}`, borderRadius: 10, color: isDark ? '#4ade80' : '#15803d', display: 'flex', fontSize: 13, gap: 8, justifyContent: 'space-between', marginBottom: 20, padding: '12px 16px' }}>
            <span><Check size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />{successBanner}</span>
            <button onClick={() => setSuccessBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, padding: 0 }}><X size={14} /></button>
          </div>
        )}

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

        {/* Added (MCP oauth) section */}
        {pendingApps.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Added to Fi</span>
              <span style={{ background: isDark ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.1)', borderRadius: 10, color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: 11, padding: '1px 7px' }}>{pendingApps.length}</span>
            </div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {pendingApps.map(app => (
                <div key={app.id} style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${isDark ? 'rgba(96,165,250,0.25)' : 'rgba(37,99,235,0.15)'}`, borderRadius: 12, display: 'flex', gap: 12, padding: '12px 14px' }}>
                  <AppIcon logo={app.logo} name={app.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                      <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                      <span style={{ background: isDark ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.1)', borderRadius: 6, color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: 10, fontWeight: 600, padding: '1px 6px' }}>Added</span>
                    </div>
                    <div style={{ color: textSub, fontSize: 11, marginTop: 2 }}>Authenticate when you use it in chat</div>
                  </div>
                  <button onClick={() => {
                    setAdded(prev => { const next = prev.filter(x => x !== app.id); writeLS(LS_ADDED_KEY, next); return next; });
                  }} style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grouped available categories */}
        {Object.entries(groupedByCategory).map(([category, categoryApps]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>{category}</div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {categoryApps.map(app => {
                const isConnecting = connecting === app.id;
                const isOauth = app.auth === 'oauth';
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
                      <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isConnecting ? 'Connecting...' : app.desc}
                      </div>
                    </div>
                    <button disabled={isConnecting}
                      style={{ alignItems: 'center', background: isOauth ? 'transparent' : text, border: isOauth ? `0.5px solid ${border}` : 'none', borderRadius: 8, color: isOauth ? textSub : bg, cursor: isConnecting ? 'wait' : 'pointer', display: 'flex', flexShrink: 0, fontSize: 11, fontWeight: 500, gap: 4, opacity: isConnecting ? 0.6 : 1, padding: '5px 12px', whiteSpace: 'nowrap' }}>
                      {isConnecting ? '...' : isOauth ? <><Plus size={11} /> Add to Fi</> : 'Connect'}
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

      {/* API Key modal */}
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
            <input value={apiKeyValue} onChange={e => setApiKeyValue(e.target.value)}
              placeholder="Paste your API key here..." type="password"
              style={{ background: isDark ? '#1f1f1e' : '#f9f8f7', border: `0.5px solid ${border}`, borderRadius: 8, color: text, fontSize: 13, marginBottom: 16, outline: 'none', padding: '10px 12px', width: '100%' }} />
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
