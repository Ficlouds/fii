'use client';

import { Check, Key, Search, X } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

import { useIsDark } from '@/hooks/useIsDark';
import { listAccounts, signIn } from '@/libs/better-auth/auth-client';
import { useToolStore } from '@/store/tool';

const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const LOGO_MAP: Record<string, string> = {
  gmail: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  gdrive: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',
  gcalendar: 'https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png',
  gsheets: 'https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico',
  gdocs: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
  gslides: 'https://ssl.gstatic.com/docs/presentations/images/favicon5.ico',
  gforms: 'https://ssl.gstatic.com/docs/spreadsheets/forms/favicon_qp2.png',
  gmeet: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png',
  gchat: 'https://ssl.gstatic.com/chat/favicon/favicon_96dp.png',
  gtasks: 'https://ssl.gstatic.com/images/branding/product/2x/tasks_2020q4_48dp.png',
  youtube: 'https://www.youtube.com/favicon.ico',
  youtubeanalytics: 'https://www.youtube.com/favicon.ico',
  googleanalytics: 'https://ssl.gstatic.com/analytics/20230726/favicon_analytics_v2_192px.png',
  googleads: 'https://www.gstatic.com/images/branding/product/2x/google_ads_48dp.png',
  googlebigquery: 'https://ssl.gstatic.com/pantheon/images/bigquery/favicon.ico',
  looker: 'https://www.gstatic.com/images/branding/product/2x/looker_48dp.png',
  outlook: 'https://res.cdn.office.net/assets/mail/pwa/v1/logos/img_logo.png',
  onedrive: 'https://res.cdn.office.net/assets/onedrive/webapp/6c.0.0/images/favicon.ico',
  teams: 'https://res.cdn.office.net/assets/team/windows/2020/microsoft-teams-icon.ico',
  excel: 'https://res.cdn.office.net/assets/excel/pwa/images/microsoft_excel_icon_128.png',
  word: 'https://res.cdn.office.net/assets/word/pwa/images/microsoft_word_icon_128.png',
  powerpoint: 'https://res.cdn.office.net/assets/powerpoint/pwa/images/microsoft_powerpoint_icon_128.png',
  sharepoint: 'https://res.cdn.office.net/assets/sharepoint/pwa/images/microsoft_sharepoint_icon_128.png',
  onenote: 'https://res.cdn.office.net/assets/onenote/pwa/images/microsoft_onenote_icon_128.png',
  mstodo: 'https://to-do.microsoft.com/favicon.ico',
  msplanner: 'https://res.cdn.office.net/assets/planner/planner-favicon.ico',
  slack: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
  notion: 'https://www.notion.so/images/favicon.ico',
  github: 'https://github.com/favicon.ico',
  figma: 'https://static.figma.com/app/icon/1/favicon.ico',
  linear: 'https://linear.app/favicon.ico',
  hubspot: 'https://www.hubspot.com/favicon.ico',
  canva: 'https://www.canva.com/favicon.ico',
  asana: 'https://asana.com/favicon.ico',
  atlassian: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png',
  box: 'https://www.box.com/favicon.ico',
  dropbox: 'https://cfl.dropboxstatic.com/static/images/favicon-vfl8lUR9B.ico',
  stripe: 'https://stripe.com/favicon.ico',
  shopify: 'https://cdn.shopify.com/static/shopify-favicon.png',
  paypal: 'https://www.paypal.com/favicon.ico',
  supabase: 'https://supabase.com/favicon/favicon-32x32.png',
  sentry: 'https://sentry.io/favicon.ico',
  cloudflare: 'https://www.cloudflare.com/favicon.ico',
  neon: 'https://neon.tech/favicon.ico',
  vercel: 'https://vercel.com/favicon.ico',
  intercom: 'https://www.intercom.com/favicon.ico',
  airtable: 'https://airtable.com/favicon.ico',
  replicate: 'https://replicate.com/favicon.ico',
  huggingface: 'https://huggingface.co/favicon.ico',
  elevenlabs: 'https://elevenlabs.io/favicon.ico',
  runway: 'https://runwayml.com/favicon.ico',
  stability: 'https://stability.ai/favicon.ico',
  midjourney: 'https://www.midjourney.com/favicon.ico',
  adobe: 'https://www.adobe.com/favicon.ico',
  discord: 'https://discord.com/assets/favicon.ico',
  telegram: 'https://telegram.org/favicon.ico',
  whatsapp: 'https://www.whatsapp.com/favicon.ico',
  zoom: 'https://zoom.us/favicon.ico',
  twilio: 'https://www.twilio.com/favicon.ico',
  clickup: 'https://clickup.com/favicon.ico',
  monday: 'https://monday.com/favicon.ico',
  trello: 'https://trello.com/favicon.ico',
  todoist: 'https://todoist.com/favicon.ico',
  evernote: 'https://evernote.com/favicon.ico',
  salesforce: 'https://www.salesforce.com/favicon.ico',
  clay: 'https://clay.com/favicon.ico',
  zendesk: 'https://www.zendesk.com/favicon.ico',
  pipedrive: 'https://www.pipedrive.com/favicon.ico',
  freshdesk: 'https://freshdesk.com/favicon.ico',
  gitlab: 'https://gitlab.com/favicon.ico',
  postman: 'https://www.postman.com/favicon.ico',
  aws: 'https://aws.amazon.com/favicon.ico',
  firebase: 'https://firebase.google.com/favicon.ico',
  mongodb: 'https://www.mongodb.com/favicon.ico',
  render: 'https://render.com/favicon.ico',
  netlify: 'https://www.netlify.com/favicon.ico',
  datadog: 'https://www.datadoghq.com/favicon.ico',
  pagerduty: 'https://www.pagerduty.com/favicon.ico',
  razorpay: 'https://razorpay.com/favicon.ico',
  quickbooks: 'https://quickbooks.intuit.com/favicon.ico',
  xero: 'https://www.xero.com/favicon.ico',
  brex: 'https://www.brex.com/favicon.ico',
  plaid: 'https://plaid.com/favicon.ico',
  mixpanel: 'https://mixpanel.com/favicon.ico',
  amplitude: 'https://amplitude.com/favicon.ico',
  segment: 'https://segment.com/favicon.ico',
  hotjar: 'https://www.hotjar.com/favicon.ico',
  twitter: 'https://abs.twimg.com/favicons/twitter.3.ico',
  linkedin: 'https://www.linkedin.com/favicon.ico',
  wordpress: 'https://s.w.org/favicon.ico',
  instagram: 'https://www.instagram.com/favicon.ico',
  facebook: 'https://www.facebook.com/favicon.ico',
  tiktok: 'https://www.tiktok.com/favicon.ico',
  pinterest: 'https://www.pinterest.com/favicon.ico',
  reddit: 'https://www.reddit.com/favicon.ico',
  woocommerce: 'https://woocommerce.com/favicon.ico',
  amazon: 'https://www.amazon.com/favicon.ico',
  flipkart: 'https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-icons/app-icons/favicon-32x32.png',
  klaviyo: 'https://www.klaviyo.com/favicon.ico',
  openai: 'https://openai.com/favicon.ico',
  anthropic: 'https://www.anthropic.com/favicon.ico',
  perplexity: 'https://www.perplexity.ai/favicon.ico',
  higgsfield: 'https://higgsfield.ai/favicon.ico',
  hex: 'https://hex.tech/favicon.ico',
  cashfree: 'https://www.cashfree.com/favicon.ico',
};

const GOOGLE_APP_IDS = ['gmail','gdrive','gcalendar','gsheets','gdocs','gslides','gforms','gmeet','gchat','gtasks','youtube','youtubeanalytics','googleanalytics','googleads','googlebigquery','looker'];
const MICROSOFT_APP_IDS = ['outlook','onedrive','teams','excel','word','powerpoint','sharepoint','onenote','mstodo','msplanner'];

const OAUTH_URLS: Record<string, string> = {
  slack: 'https://slack.com/oauth/v2/authorize?client_id=11283223980215.11300538241825&scope=channels:read,channels:history,chat:write,users:read,search:read,files:read,groups:read,im:read,mpim:read&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fslack',
  hubspot: 'https://app.hubspot.com/oauth/authorize?client_id=f030ab61-bfaf-4a80-8c27-2a4d2784016b&scope=crm.objects.contacts.read%20crm.objects.deals.read%20crm.objects.companies.read&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fhubspot',
  notion: 'https://api.notion.com/v1/oauth/authorize?client_id=377d872b-594c-81fc-9c4f-00374782bd6e&response_type=code&owner=user&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fnotion',
  github: 'https://github.com/login/oauth/authorize?client_id=Ov23lijVWI91JZFThB12&scope=repo%2Cuser%2Cread%3Aorg&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fgithub',
  figma: 'https://www.figma.com/oauth?client_id=jAAgh1HbOPtzxprXTIx6UE&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Ffigma&scope=file_read&response_type=code',
  linear: 'https://linear.app/oauth/authorize?client_id=4a55ee60d83c5cb6dfbd1e8f23a87b13&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Flinear&response_type=code&scope=read%2Cwrite',
  asana: 'https://app.asana.com/-/oauth_authorize?client_id=1215470227190828&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fasana&response_type=code',
  atlassian: 'https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=JGpbzD66rrV2TRfAleKCthJ6NgJh2GyA&scope=read%3Ajira-work%20write%3Ajira-work%20read%3Aconfluence-content.all&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fatlassian&response_type=code&prompt=consent',
  box: 'https://account.box.com/api/oauth2/authorize?client_id=kkhdqrucdyucer9ebvsb8xtpd9siugxl&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fbox&response_type=code',
  dropbox: 'https://www.dropbox.com/oauth2/authorize?client_id=vgnmbsj727pkesr&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fdropbox&response_type=code&token_access_type=offline',
  canva: 'https://www.canva.com/api/oauth/authorize?client_id=OC-AZ6en9YG18wS&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fcanva&response_type=code&scope=asset%3Aread%20asset%3Awrite%20design%3Acontent%3Aread%20design%3Acontent%3Awrite%20design%3Ameta%3Aread%20profile%3Aread',
  shopify: 'https://accounts.shopify.com/oauth/authorize?client_id=f24744b60760fff8f77947d688f78849&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fshopify&response_type=code',
  paypal: 'https://www.sandbox.paypal.com/signin/authorize?client_id=AWgCuTemLtUiU1FFt27zA8yPqbU6D-rb3Wcucw9EVPNl_kPDaFMAfTjnFD5cJbxENvsZORvISEUMjvgz&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Foauth%2Fcallback%2Fpaypal&response_type=code&scope=openid%20profile%20email',
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
  { id: 'higgsfield', name: 'Higgsfield', desc: 'AI video generation — Sora, Veo3, Kling, 30+ models', category: 'Creative', mcpUrl: 'https://mcp.higgsfield.ai/mcp', logo: fav('higgsfield.ai'), auth: 'apikey' },
  { id: 'canva', name: 'Canva', desc: 'Create designs, presentations and visual content', category: 'Creative', mcpUrl: 'https://mcp.canva.com/mcp', logo: fav('canva.com'), auth: 'oauth_registered' },
  { id: 'figma', name: 'Figma', desc: 'Design files, components and prototypes', category: 'Creative', mcpUrl: 'https://mcp.figma.com/mcp', logo: fav('figma.com'), auth: 'oauth_registered' },
  { id: 'elevenlabs', name: 'ElevenLabs', desc: 'AI voice generation and text to speech', category: 'Creative', mcpUrl: 'https://api.elevenlabs.io', logo: fav('elevenlabs.io'), auth: 'apikey' },
  { id: 'runway', name: 'Runway', desc: 'AI video and image generation tools', category: 'Creative', mcpUrl: 'https://api.dev.runwayml.com', logo: fav('runwayml.com'), auth: 'apikey' },
  { id: 'adobe', name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere and more', category: 'Creative', mcpUrl: 'https://adobeioruntime.net', logo: fav('adobe.com'), auth: 'apikey' },
  // Communication
  { id: 'slack', name: 'Slack', desc: 'Send messages, search conversations, manage channels', category: 'Communication', mcpUrl: 'https://mcp.slack.com/mcp', logo: fav('slack.com'), auth: 'oauth_registered' },
  { id: 'discord', name: 'Discord', desc: 'Messaging, servers and community management', category: 'Communication', mcpUrl: 'https://discord.com/api', logo: fav('discord.com'), auth: 'apikey' },
  { id: 'telegram', name: 'Telegram', desc: 'Messaging and bot automation', category: 'Communication', mcpUrl: 'https://api.telegram.org', logo: fav('telegram.org'), auth: 'apikey' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Business messaging and customer engagement', category: 'Communication', mcpUrl: 'https://graph.facebook.com', logo: fav('business.whatsapp.com'), auth: 'apikey' },
  { id: 'zoom', name: 'Zoom', desc: 'Video meetings, webinars and recordings', category: 'Communication', mcpUrl: 'https://api.zoom.us/v2', logo: fav('zoom.us'), auth: 'apikey' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS, voice calls and messaging APIs', category: 'Communication', mcpUrl: 'https://api.twilio.com', logo: fav('twilio.com'), auth: 'apikey' },
  // Productivity
  { id: 'notion', name: 'Notion', desc: 'Read and write pages, databases and workspaces', category: 'Productivity', mcpUrl: 'https://mcp.notion.com/mcp', logo: fav('notion.so'), auth: 'oauth_registered' },
  { id: 'asana', name: 'Asana', desc: 'Projects, tasks and team workflow management', category: 'Productivity', mcpUrl: 'https://mcp.asana.com/mcp', logo: fav('asana.com'), auth: 'oauth_registered' },
  { id: 'linear', name: 'Linear', desc: 'Issues, projects, cycles and team management', category: 'Productivity', mcpUrl: 'https://mcp.linear.app/mcp', logo: fav('linear.app'), auth: 'oauth_registered' },
  { id: 'monday', name: 'Monday.com', desc: 'Boards, items and project tracking', category: 'Productivity', mcpUrl: 'https://api.monday.com', logo: fav('monday.com'), auth: 'apikey' },
  { id: 'clickup', name: 'ClickUp', desc: 'Tasks, docs and project collaboration', category: 'Productivity', mcpUrl: 'https://api.clickup.com', logo: fav('clickup.com'), auth: 'coming_soon' },
  { id: 'box', name: 'Box', desc: 'Enterprise file storage, metadata and sharing', category: 'Productivity', mcpUrl: 'https://mcp.box.com/mcp', logo: fav('box.com'), auth: 'oauth_registered' },
  { id: 'dropbox', name: 'Dropbox', desc: 'Cloud file storage and collaboration', category: 'Productivity', mcpUrl: 'https://api.dropbox.com', logo: fav('dropbox.com'), auth: 'oauth_registered' },
  { id: 'airtable', name: 'Airtable', desc: 'Database, spreadsheet and workflow platform', category: 'Productivity', mcpUrl: 'https://mcp.airtable.com/mcp', logo: fav('airtable.com'), auth: 'oauth_dcr' },
  { id: 'todoist', name: 'Todoist', desc: 'Task management and to-do lists', category: 'Productivity', mcpUrl: 'https://api.todoist.com', logo: fav('todoist.com'), auth: 'apikey' },
  { id: 'trello', name: 'Trello', desc: 'Visual boards and card-based task tracking', category: 'Productivity', mcpUrl: 'https://api.trello.com', logo: fav('trello.com'), auth: 'apikey' },
  // CRM
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM contacts, deals and marketing pipelines', category: 'CRM', mcpUrl: 'https://mcp.hubspot.com', logo: fav('hubspot.com'), auth: 'oauth_registered' },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM leads, opportunities and contacts', category: 'CRM', mcpUrl: 'https://mcp.salesforce.com/mcp', logo: fav('salesforce.com'), auth: 'coming_soon' },
  { id: 'clay', name: 'Clay', desc: 'Data enrichment, lead lists and CRM sync', category: 'CRM', mcpUrl: 'https://api.clay.com', logo: fav('clay.com'), auth: 'apikey' },
  { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets and interactions', category: 'CRM', mcpUrl: 'https://api.zendesk.com', logo: fav('zendesk.com'), auth: 'apikey' },
  { id: 'intercom', name: 'Intercom', desc: 'Customer messaging and support platform', category: 'CRM', mcpUrl: 'https://mcp.intercom.com', logo: fav('intercom.com'), auth: 'oauth_dcr' },
  { id: 'pipedrive', name: 'Pipedrive', desc: 'Sales pipeline and deal management', category: 'CRM', mcpUrl: 'https://api.pipedrive.com', logo: fav('pipedrive.com'), auth: 'apikey' },
  // Developer
  { id: 'github', name: 'GitHub', desc: 'Repositories, issues, PRs and workflows', category: 'Developer', mcpUrl: 'https://api.githubcopilot.com/mcp/', logo: fav('github.com'), auth: 'oauth_registered' },
  { id: 'gitlab', name: 'GitLab', desc: 'Repository, CI/CD and DevOps platform', category: 'Developer', mcpUrl: 'https://gitlab.com', logo: fav('gitlab.com'), auth: 'apikey' },
  { id: 'vercel', name: 'Vercel', desc: 'Deployments, logs and project environments', category: 'Developer', mcpUrl: 'https://mcp.vercel.com', logo: fav('vercel.com'), auth: 'coming_soon' },
  { id: 'sentry', name: 'Sentry', desc: 'Error tracking, issues and performance', category: 'Developer', mcpUrl: 'https://mcp.sentry.dev/mcp', logo: fav('sentry.io'), auth: 'oauth_dcr' },
  { id: 'supabase', name: 'Supabase', desc: 'Database, auth, storage and realtime', category: 'Developer', mcpUrl: 'https://mcp.supabase.com/mcp', logo: fav('supabase.com'), auth: 'oauth_dcr' },
  { id: 'cloudflare', name: 'Cloudflare', desc: 'Workers, KV storage and DNS management', category: 'Developer', mcpUrl: 'https://mcp.cloudflare.com/mcp', logo: fav('cloudflare.com'), auth: 'oauth_dcr' },
  { id: 'neon', name: 'Neon', desc: 'Serverless Postgres with branching', category: 'Developer', mcpUrl: 'https://mcp.neon.tech/mcp', logo: fav('neon.tech'), auth: 'oauth_dcr' },
  { id: 'atlassian', name: 'Jira & Confluence', desc: 'Issues, tickets and team documentation', category: 'Developer', mcpUrl: 'https://mcp.atlassian.com/v1/mcp', logo: fav('atlassian.com'), auth: 'oauth_registered' },
  { id: 'firebase', name: 'Firebase', desc: 'App backend, Firestore, Auth and hosting', category: 'Developer', mcpUrl: 'https://firebase.google.com', logo: fav('firebase.google.com'), auth: 'apikey' },
  { id: 'postman', name: 'Postman', desc: 'API development and testing platform', category: 'Developer', mcpUrl: 'https://api.getpostman.com', logo: fav('postman.com'), auth: 'apikey' },
  { id: 'aws', name: 'AWS', desc: 'Cloud infrastructure and services', category: 'Developer', mcpUrl: 'https://aws.amazon.com', logo: fav('aws.amazon.com'), auth: 'apikey' },
  { id: 'datadog', name: 'Datadog', desc: 'Monitoring, metrics and observability', category: 'Developer', mcpUrl: 'https://api.datadoghq.com', logo: fav('datadoghq.com'), auth: 'apikey' },
  { id: 'pagerduty', name: 'PagerDuty', desc: 'Incident management and on-call alerting', category: 'Developer', mcpUrl: 'https://api.pagerduty.com', logo: fav('pagerduty.com'), auth: 'apikey' },
  // Finance
  { id: 'stripe', name: 'Stripe', desc: 'Payments, subscriptions and invoices', category: 'Finance', mcpUrl: 'https://mcp.stripe.com', logo: fav('stripe.com'), auth: 'oauth_dcr' },
  { id: 'paypal', name: 'PayPal', desc: 'Payments, invoices and transactions', category: 'Finance', mcpUrl: 'https://mcp.paypal.com/http', logo: fav('paypal.com'), auth: 'oauth_registered' },
  { id: 'cashfree', name: 'Cashfree', desc: 'Payment gateway and payouts (India)', category: 'Finance', mcpUrl: 'https://api.cashfree.com', logo: fav('cashfree.com'), auth: 'apikey' },
  { id: 'razorpay', name: 'Razorpay', desc: 'Payment gateway for India', category: 'Finance', mcpUrl: 'https://api.razorpay.com', logo: fav('razorpay.com'), auth: 'apikey' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting and financial management', category: 'Finance', mcpUrl: 'https://quickbooks.intuit.com', logo: fav('quickbooks.intuit.com'), auth: 'apikey' },
  { id: 'xero', name: 'Xero', desc: 'Cloud accounting and bookkeeping', category: 'Finance', mcpUrl: 'https://api.xero.com', logo: fav('xero.com'), auth: 'apikey' },
  { id: 'plaid', name: 'Plaid', desc: 'Bank account connections and financial data', category: 'Finance', mcpUrl: 'https://api.plaid.com', logo: fav('plaid.com'), auth: 'coming_soon' },
  { id: 'brex', name: 'Brex', desc: 'Business banking and spend management', category: 'Finance', mcpUrl: 'https://platform.brexapis.com', logo: fav('brex.com'), auth: 'apikey' },
  // Analytics
  { id: 'amplitude', name: 'Amplitude', desc: 'Product analytics, user journeys and A/B testing', category: 'Analytics', mcpUrl: 'https://mcp.amplitude.com/mcp', logo: fav('amplitude.com'), auth: 'apikey' },
  { id: 'hex', name: 'Hex', desc: 'Data notebooks, analytics and interactive charts', category: 'Analytics', mcpUrl: 'https://mcp.hex.tech/mcp', logo: fav('hex.tech'), auth: 'apikey' },
  { id: 'mixpanel', name: 'Mixpanel', desc: 'Product analytics and user behaviour', category: 'Analytics', mcpUrl: 'https://mixpanel.com', logo: fav('mixpanel.com'), auth: 'apikey' },
  { id: 'segment', name: 'Segment', desc: 'Customer data platform and event tracking', category: 'Analytics', mcpUrl: 'https://segment.com', logo: fav('segment.com'), auth: 'apikey' },
  { id: 'lookerbi', name: 'Looker', desc: 'Business intelligence and data exploration', category: 'Analytics', mcpUrl: 'https://looker.com', logo: fav('looker.com'), auth: 'apikey' },
  // Google Workspace
  { id: 'gmail', name: 'Gmail', desc: 'Read, compose and manage your emails', category: 'Google', mcpUrl: 'https://gmailmcp.googleapis.com/mcp/v1', logo: fav('gmail.com'), auth: 'google' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Search, read and upload files', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('drive.google.com'), auth: 'google' },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Manage events and schedule meetings', category: 'Google', mcpUrl: 'https://calendarmcp.googleapis.com/mcp/v1', logo: fav('calendar.google.com'), auth: 'google' },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets and data analysis', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('sheets.google.com'), auth: 'google' },
  { id: 'gdocs', name: 'Google Docs', desc: 'Documents and collaborative writing', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('docs.google.com'), auth: 'google' },
  { id: 'gslides', name: 'Google Slides', desc: 'Presentations and slide decks', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('slides.google.com'), auth: 'google' },
  { id: 'gforms', name: 'Google Forms', desc: 'Surveys, quizzes and form responses', category: 'Google', mcpUrl: 'https://drivemcp.googleapis.com/mcp/v1', logo: fav('forms.google.com'), auth: 'google' },
  { id: 'gmeet', name: 'Google Meet', desc: 'Video meetings and conferencing', category: 'Google', mcpUrl: 'https://meet.google.com', logo: fav('meet.google.com'), auth: 'google' },
  { id: 'gchat', name: 'Google Chat', desc: 'Team messaging and spaces', category: 'Google', mcpUrl: 'https://chat.google.com', logo: fav('chat.google.com'), auth: 'google' },
  { id: 'gtasks', name: 'Google Tasks', desc: 'Task lists and to-dos', category: 'Google', mcpUrl: 'https://tasks.google.com', logo: fav('tasks.google.com'), auth: 'google' },
  { id: 'youtube', name: 'YouTube', desc: 'Video search, transcripts and channel management', category: 'Google', mcpUrl: 'https://youtube.com', logo: fav('youtube.com'), auth: 'google' },
  { id: 'youtubeanalytics', name: 'YouTube Analytics', desc: 'Channel and video performance data', category: 'Google', mcpUrl: 'https://studio.youtube.com', logo: fav('studio.youtube.com'), auth: 'google' },
  { id: 'googleanalytics', name: 'Google Analytics', desc: 'Web analytics and reporting', category: 'Google', mcpUrl: 'https://analytics.google.com', logo: fav('analytics.google.com'), auth: 'google' },
  { id: 'googleads', name: 'Google Ads', desc: 'Ad campaigns, keywords and performance', category: 'Google', mcpUrl: 'https://ads.google.com', logo: fav('ads.google.com'), auth: 'google' },
  { id: 'googlebigquery', name: 'BigQuery', desc: 'Serverless data warehouse and SQL analytics', category: 'Google', mcpUrl: 'https://cloud.google.com', logo: fav('cloud.google.com'), auth: 'google' },
  { id: 'looker', name: 'Looker Studio', desc: 'Dashboards and data visualisation', category: 'Google', mcpUrl: 'https://lookerstudio.google.com', logo: fav('lookerstudio.google.com'), auth: 'google' },
  // Microsoft 365
  { id: 'outlook', name: 'Outlook', desc: 'Email, calendar and contacts', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('outlook.com'), auth: 'microsoft' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Cloud file storage and sharing', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('onedrive.com'), auth: 'microsoft' },
  { id: 'teams', name: 'Microsoft Teams', desc: 'Team messaging and video meetings', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('teams.microsoft.com'), auth: 'microsoft' },
  { id: 'excel', name: 'Microsoft Excel', desc: 'Spreadsheets and data analysis', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('excel.office.com'), auth: 'microsoft' },
  { id: 'word', name: 'Microsoft Word', desc: 'Documents and collaborative writing', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('word.office.com'), auth: 'microsoft' },
  { id: 'powerpoint', name: 'PowerPoint', desc: 'Presentations and slide decks', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('powerpoint.office.com'), auth: 'microsoft' },
  { id: 'sharepoint', name: 'SharePoint', desc: 'Intranet, document management and collaboration', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('sharepoint.com'), auth: 'microsoft' },
  { id: 'onenote', name: 'OneNote', desc: 'Notes, notebooks and knowledge capture', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('onenote.com'), auth: 'microsoft' },
  { id: 'mstodo', name: 'Microsoft To Do', desc: 'Tasks, lists and daily planning', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('todo.microsoft.com'), auth: 'microsoft' },
  { id: 'msplanner', name: 'Microsoft Planner', desc: 'Team task boards and project tracking', category: 'Microsoft', mcpUrl: 'https://agent365.svc.cloud.microsoft', logo: fav('tasks.office.com'), auth: 'microsoft' },
  // Social
  { id: 'twitter', name: 'X (Twitter)', desc: 'Post, search and manage tweets', category: 'Social', mcpUrl: 'https://api.twitter.com', logo: fav('x.com'), auth: 'apikey' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional network and content', category: 'Social', mcpUrl: 'https://api.linkedin.com', logo: fav('linkedin.com'), auth: 'apikey' },
  { id: 'wordpress', name: 'WordPress', desc: 'CMS and blog management', category: 'Social', mcpUrl: 'https://wordpress.com', logo: fav('wordpress.com'), auth: 'apikey' },
  { id: 'instagram', name: 'Instagram', desc: 'Post management and content publishing', category: 'Social', mcpUrl: 'https://graph.facebook.com', logo: fav('instagram.com'), auth: 'apikey' },
  { id: 'pinterest', name: 'Pinterest', desc: 'Visual content and pin management', category: 'Social', mcpUrl: 'https://api.pinterest.com', logo: fav('pinterest.com'), auth: 'apikey' },
  { id: 'tiktok', name: 'TikTok', desc: 'Short video creation and analytics', category: 'Social', mcpUrl: 'https://business-api.tiktok.com', logo: fav('tiktok.com'), auth: 'apikey' },
  { id: 'medium', name: 'Medium', desc: 'Publishing articles and blog posts', category: 'Social', mcpUrl: 'https://api.medium.com', logo: fav('medium.com'), auth: 'apikey' },
  // E-commerce
  { id: 'shopify', name: 'Shopify', desc: 'Products, orders and store management', category: 'E-commerce', mcpUrl: 'https://mcp.shopify.com/mcp', logo: fav('shopify.com'), auth: 'oauth_registered' },
  { id: 'woocommerce', name: 'WooCommerce', desc: 'WordPress-based online store management', category: 'E-commerce', mcpUrl: 'https://woocommerce.com', logo: fav('woocommerce.com'), auth: 'apikey' },
  { id: 'bigcommerce', name: 'BigCommerce', desc: 'Enterprise ecommerce platform', category: 'E-commerce', mcpUrl: 'https://bigcommerce.com', logo: fav('bigcommerce.com'), auth: 'apikey' },
  { id: 'etsy', name: 'Etsy', desc: 'Marketplace listings, orders and shop analytics', category: 'E-commerce', mcpUrl: 'https://openapi.etsy.com', logo: fav('etsy.com'), auth: 'apikey' },
  { id: 'amazon', name: 'Amazon Seller', desc: 'Product listings, orders and FBA management', category: 'E-commerce', mcpUrl: 'https://sellercentral.amazon.com', logo: fav('amazon.com'), auth: 'apikey' },
  { id: 'flipkart', name: 'Flipkart Seller', desc: 'Product listings and seller account management', category: 'E-commerce', mcpUrl: 'https://seller.flipkart.com', logo: fav('flipkart.com'), auth: 'apikey' },
  { id: 'klaviyo', name: 'Klaviyo', desc: 'Email and SMS marketing for ecommerce', category: 'E-commerce', mcpUrl: 'https://a.klaviyo.com', logo: fav('klaviyo.com'), auth: 'apikey' },
  // AI
  { id: 'openai', name: 'OpenAI', desc: 'GPT models, DALL-E and Whisper', category: 'AI', mcpUrl: 'https://api.openai.com', logo: fav('openai.com'), auth: 'apikey' },
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude AI models and APIs', category: 'AI', mcpUrl: 'https://api.anthropic.com', logo: fav('anthropic.com'), auth: 'apikey' },
  { id: 'replicate', name: 'Replicate', desc: 'Run AI models in the cloud', category: 'AI', mcpUrl: 'https://mcp.replicate.com/mcp', logo: fav('replicate.com'), auth: 'oauth_dcr' },
  { id: 'huggingface', name: 'Hugging Face', desc: 'Open source AI models and datasets', category: 'AI', mcpUrl: 'https://mcp.huggingface.co/mcp', logo: fav('huggingface.co'), auth: 'oauth_dcr' },
  { id: 'perplexity', name: 'Perplexity', desc: 'AI-powered search and research', category: 'AI', mcpUrl: 'https://api.perplexity.ai', logo: fav('perplexity.ai'), auth: 'apikey' },
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

// The old elapsed-time heuristic produced false "connected" states — wipe them once on upgrade
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

const PRIVACY_BULLETS_FIRST_PARTY = [
  'Fi reads your data in real time — nothing is stored on Fi servers',
  'We never train on your personal data',
  'You can disconnect at any time from this page',
];
const PRIVACY_BULLETS_THIRD_PARTY = [
  'Third-party connector — not built or maintained by Fi',
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
        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5 }}>{app.name.slice(0, 2).toUpperCase()}</span>
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

  const installCustomPlugin = useToolStore((s) => s.installCustomPlugin);

  const bg = isDark ? '#1f1f1e' : '#f9f8f7';
  const cardBg = isDark ? '#2c2c2b' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text = isDark ? '#ffffff' : '#111111';
  const textSub = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textTertiary = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

  const showBanner = useCallback((type: BannerState['type'], message: string) => {
    setBanner({ message, type });
  }, []);

  // Auto-dismiss banner with fade-out
  useEffect(() => {
    if (!banner) return;
    setBannerVisible(true);
    const fadeTimer = setTimeout(() => setBannerVisible(false), 3700);
    const removeTimer = setTimeout(() => setBanner(null), 4000);
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

  // On mount: restore connected state from the URL, the session, and pending first-party flags
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccessParam = params.get('oauth_success');

    if (oauthSuccessParam) {
      if (oauthSuccessParam === 'google') {
        markConnectedBulk(GOOGLE_APP_IDS);
        showBanner('success', 'Google connected successfully');
      } else if (oauthSuccessParam === 'microsoft') {
        markConnectedBulk(MICROSOFT_APP_IDS);
        showBanner('success', 'Microsoft connected successfully');
      } else {
        const app = MCP_APPS.find(a => a.id === oauthSuccessParam);
        if (app) {
          markConnected(app.id);
          showBanner('success', `${app.name} connected successfully`);
        }
      }
      params.delete('oauth_success');
      const rest = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
    }

    const pendingGoogle = localStorage.getItem('fi:pending-google');
    const pendingMicrosoft = localStorage.getItem('fi:pending-microsoft');

    listAccounts()
      .then(result => {
        const accounts = result.data ?? [];
        const hasGoogle = accounts.some(a => a.providerId === 'google');
        const hasMicrosoft = accounts.some(
          a => a.providerId === 'microsoft' || a.providerId === 'microsoft-entra-id',
        );
        if (hasGoogle) markConnectedBulk(GOOGLE_APP_IDS);
        if (hasMicrosoft) markConnectedBulk(MICROSOFT_APP_IDS);

        if (pendingGoogle) {
          localStorage.removeItem('fi:pending-google');
          if (hasGoogle && !oauthSuccessParam) showBanner('success', 'Google connected successfully');
        }
        if (pendingMicrosoft) {
          localStorage.removeItem('fi:pending-microsoft');
          if (hasMicrosoft && !oauthSuccessParam) showBanner('success', 'Microsoft connected successfully');
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polls localStorage for the flag set by the /api/oauth/callback/[provider] success/error page —
  // this is the only reliable signal since the OAuth tab runs in a separate browsing context
  const startPollingForOAuth = useCallback((app: McpApp) => {
    setPollingApp(app.id);
    const startedAt = Date.now();

    const pollInterval = setInterval(() => {
      try {
        const successRaw = localStorage.getItem(LS_OAUTH_SUCCESS_KEY);
        if (successRaw) {
          const data = JSON.parse(successRaw);
          if (data?.provider === app.id) {
            clearInterval(pollInterval);
            localStorage.removeItem(LS_OAUTH_SUCCESS_KEY);
            setPollingApp(null);
            markConnected(app.id);
            showBanner('success', `${app.name} connected successfully`);
            return;
          }
        }

        const failedRaw = localStorage.getItem(LS_OAUTH_FAILED_KEY);
        if (failedRaw) {
          const data = JSON.parse(failedRaw);
          if (data?.provider === app.id) {
            clearInterval(pollInterval);
            localStorage.removeItem(LS_OAUTH_FAILED_KEY);
            setPollingApp(null);
            showBanner('error', `Failed to connect ${app.name} — please try again`);
            return;
          }
        }
      } catch {}

      if (Date.now() - startedAt > 300_000) {
        clearInterval(pollInterval);
        setPollingApp(null);
      }
    }, 500);
  }, [markConnected, showBanner]);

  const handleConnect = useCallback((app: McpApp) => {
    if (app.auth === 'coming_soon') return;

    if (app.auth === 'apikey') {
      setApiKeyModal(app.id);
      setApiKeyValue('');
      return;
    }

    // google, microsoft, oauth_registered, oauth_dcr — show info modal first
    setInfoModalApp(app);
  }, []);

  const handleInfoConfirm = useCallback(async () => {
    if (!infoModalApp) return;
    const app = infoModalApp;
    setInfoModalApp(null);

    if (app.auth === 'oauth_dcr') {
      setConnecting(app.id);
      try {
        await installCustomPlugin({
          customParams: {
            description: app.desc,
            mcp: { auth: { type: 'none' }, type: 'http', url: app.mcpUrl },
          },
          identifier: app.id,
          type: 'customPlugin',
        });
        markConnected(app.id);
        showBanner('success', `${app.name} connected successfully`);
      } catch {
        showBanner('error', `Failed to connect ${app.name} — please try again`);
      } finally {
        setConnecting(null);
      }
      return;
    }

    if (app.auth === 'google' || app.auth === 'microsoft') {
      // Better Auth handles its own full-page redirect — a same-page navigation is correct here
      try {
        localStorage.setItem(`fi:pending-${app.auth}`, 'true');
        await signIn.social({ callbackURL: '/connect', provider: app.auth });
      } catch {
        localStorage.removeItem(`fi:pending-${app.auth}`);
        showBanner('error', `Failed to connect ${app.name} — please try again`);
      }
      return;
    }

    // oauth_registered — open the provider's consent screen in a new tab and poll for the
    // success/failure flag written by our /api/oauth/callback/[provider] route
    const oauthUrl = OAUTH_URLS[app.id];
    if (!oauthUrl) {
      showBanner('error', `Failed to connect ${app.name} — please try again`);
      return;
    }

    const popup = window.open(oauthUrl, '_blank', 'width=600,height=700,left=200,top=100');
    if (!popup) {
      showBanner('error', `Failed to connect ${app.name} — please allow popups and try again`);
      return;
    }

    startPollingForOAuth(app);
  }, [infoModalApp, installCustomPlugin, markConnected, showBanner, startPollingForOAuth]);

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
      showBanner('error', `Failed to connect ${app.name} — please try again`);
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

  const modalApp = MCP_APPS.find(a => a.id === apiKeyModal);

  const bannerColors: Record<BannerState['type'], { bg: string; fg: string }> = {
    error: { bg: '#dc2626', fg: '#ffffff' },
    success: { bg: '#16a34a', fg: '#ffffff' },
  };

  const showInfoModalPrivacyBullets = infoModalApp
    ? (infoModalApp.auth === 'google' || infoModalApp.auth === 'microsoft')
      ? PRIVACY_BULLETS_FIRST_PARTY
      : PRIVACY_BULLETS_THIRD_PARTY
    : [];

  const showInfoModalServerUrl = infoModalApp
    ? infoModalApp.auth === 'oauth_registered' || infoModalApp.auth === 'oauth_dcr'
    : false;

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
          <div style={{ display: 'flex', flex: 1, gap: 6, overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} style={{ background: activeCategory === cat ? text : 'transparent', border: `0.5px solid ${activeCategory === cat ? 'transparent' : border}`, borderRadius: 20, color: activeCategory === cat ? bg : textSub, cursor: 'pointer', flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '5px 14px', transition: 'all 0.15s' }}
                onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div style={{
          background: bannerColors[banner.type].bg,
          color: bannerColors[banner.type].fg,
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 500,
          opacity: bannerVisible ? 1 : 0,
          padding: '10px 32px',
          transition: 'opacity 0.3s ease',
        }}>
          {banner.type === 'success' && '✓ '}
          {banner.message}
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
                const isDcr = app.auth === 'oauth_dcr';
                return (
                  <div key={app.id} style={{ alignItems: 'center', background: cardBg, border: `0.5px solid ${isDcr ? (isDark ? 'rgba(96,165,250,0.25)' : 'rgba(37,99,235,0.2)') : (isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.2)')}`, borderRadius: 12, display: 'flex', gap: 12, padding: '12px 14px' }}>
                    <AppIcon app={app} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
                        <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                        {isDcr ? (
                          <span style={{ alignItems: 'center', background: isDark ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.1)', borderRadius: 6, color: isDark ? '#60a5fa' : '#2563eb', display: 'flex', fontSize: 10, fontWeight: 600, gap: 2, padding: '1px 6px' }}>
                            <Check size={9} /> Added
                          </span>
                        ) : (
                          <span style={{ alignItems: 'center', background: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.1)', borderRadius: 6, color: isDark ? '#4ade80' : '#16a34a', display: 'flex', fontSize: 10, fontWeight: 600, gap: 2, padding: '1px 6px' }}>
                            <Check size={9} /> Connected
                          </span>
                        )}
                      </div>
                      <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isDcr ? 'Authenticate on first use' : app.desc}
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, cursor: 'pointer', fontSize: 11, flexShrink: 0, padding: '4px 10px', whiteSpace: 'nowrap' }}
                      onClick={() => handleDisconnect(app.id)}>
                      Disconnect
                    </button>
                  </div>
                );
              })}
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
                      <div style={{ color: textSub, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                        style={{ background: text, border: 'none', borderRadius: 8, color: bg, cursor: isBusy ? 'wait' : 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 500, opacity: isBusy ? 0.5 : 1, padding: '5px 14px', whiteSpace: 'nowrap' }}
                        onClick={e => { e.stopPropagation(); if (!isBusy) handleConnect(app); }}>
                        {isPolling ? 'Waiting...' : isConnecting ? '...' : 'Connect'}
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

      {/* Info modal — shown for all OAuth-style apps before connecting */}
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
              {showInfoModalPrivacyBullets.map(bullet => (
                <div key={bullet} style={{ alignItems: 'flex-start', color: textSub, display: 'flex', fontSize: 12, gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: textTertiary, flexShrink: 0 }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {showInfoModalServerUrl && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: textTertiary, fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', marginBottom: 5, textTransform: 'uppercase' }}>Server URL</div>
                <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', border: `0.5px solid ${border}`, borderRadius: 8, color: textSub, fontFamily: 'monospace', fontSize: 12, overflowX: 'auto', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  {infoModalApp.mcpUrl}
                </div>
              </div>
            )}

            <p style={{ color: textTertiary, fontSize: 11, lineHeight: 1.5, margin: '0 0 20px' }}>
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
