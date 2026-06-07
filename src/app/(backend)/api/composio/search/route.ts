import { type NextRequest, NextResponse } from 'next/server';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk';
const COMPETITOR_SLUGS = ['openai', 'anthropic', 'perplexityai', 'deepseek', 'grok', 'gemini', 'mistral', 'cohere', 'claude'];

const CATEGORY_SLUGS: Record<string, string[]> = {
  Accounting: ['sage_accounting', 'zoho_books', 'netsuite'],
  Analytics: ['datadog', 'pagerduty'],
  CRM: ['hubspot', 'salesforce', 'pipedrive', 'attio', 'apollo', 'zoho', 'freshsales', 'agencyzoom', 'affinity', 'snowflake'],
  Communication: ['zoom', 'calendly', 'twilio', 'lmnt', 'heygen', 'fireflies'],
  Creative: ['figma', 'canva', 'canvas', 'elevenlabs', 'heygen'],
  Developer: ['github', 'gitlab', 'bitbucket', 'sentry', 'supabase', 'neon', 'cloudflare', 'codeinterpreter', 'browserbase_tool', 'browser_tool', 'serpapi', 'firecrawl', 'tavily', 'exa', 'hackernews', 'composio_search'],
  'E-commerce': ['shopify', 'woocommerce', 'junglescout', 'shopline'],
  Finance: ['stripe', 'quickbooks', 'xero', 'paypal', 'coinbase', 'brevo', 'freshbooks', 'exact_online'],
  Google: ['gmail', 'googledrive', 'googlecalendar', 'googlesheets', 'googledocs', 'googlemeet', 'googletasks', 'googlephotos', 'googleanalytics', 'googlebigquery', 'youtube', 'googlesuper', 'google_maps'],
  HR: ['bamboohr', 'rippling_hr', 'gusto', 'adp_workforce', 'workday', 'personio', 'hibob', 'deel', 'breezy', 'workable', 'lever', 'greenhouse_harvest', 'sage_hr'],
  Marketing: ['mailchimp', 'klaviyo', 'sendgrid', 'semrush', 'ahrefs', 'posthog', 'mixpanel', 'amplitude', 'segment', 'marketo', 'activecampaign', 'aweber', 'bigmailer'],
  Microsoft: ['outlook', 'one_drive', 'microsoft_teams', 'dynamics365', 'microsoft_clarity'],
  Productivity: ['notion', 'asana', 'linear', 'jira', 'trello', 'clickup', 'monday', 'airtable', 'wrike', 'coda', 'shortcut', 'confluence', 'cal', 'todoist', 'mem0', 'basecamp'],
  Social: ['twitter', 'linkedin', 'instagram', 'metaads', 'tiktok', 'pinterest', 'reddit', 'whatsapp', 'discord', 'slack', 'slackbot', 'discordbot', 'facebook'],
  Storage: ['dropbox', 'box', 'docusign', 'aws_s3'],
  Support: ['zendesk', 'freshdesk', 'intercom', 'front'],
};

const categorizeApp = (slug: string): string => {
  for (const [category, slugs] of Object.entries(CATEGORY_SLUGS)) {
    if (slugs.includes(slug)) return category;
  }
  return 'Other';
};

interface BrowseApp {
  category: string;
  logo: string;
  name: string;
  slug: string;
}

let cachedApps: BrowseApp[] | null = null;
let cacheTime = 0;

const getAllComposioApps = async (): Promise<BrowseApp[]> => {
  const allItems: { name?: string; slug: string }[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    try {
      const res = await fetch(
        `https://backend.composio.dev/api/v3/toolkits?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
        { headers: { 'x-api-key': COMPOSIO_API_KEY } },
      );
      const data = await res.json();
      const items = data.items || [];
      if (items.length === 0) break;
      allItems.push(...items);
      cursor = data.next_cursor;
      if (!cursor) break;
    } catch {
      break;
    }
  }
  return allItems
    .filter(item => !COMPETITOR_SLUGS.includes(item.slug))
    .map(item => ({
      category: categorizeApp(item.slug),
      logo: `https://www.google.com/s2/favicons?domain=${item.slug.replaceAll('_', '')}.com&sz=64`,
      name: item.name || item.slug,
      slug: item.slug,
    }));
};

export const GET = async (req: NextRequest) => {
  if (!cachedApps || Date.now() - cacheTime > 3_600_000) {
    cachedApps = await getAllComposioApps();
    cacheTime = Date.now();
  }
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) {
    return NextResponse.json({ items: cachedApps, total: cachedApps.length });
  }
  const needle = q.toLowerCase();
  const filtered = cachedApps.filter(item =>
    item.name.toLowerCase().includes(needle) ||
    item.slug.toLowerCase().includes(needle) ||
    item.category.toLowerCase().includes(needle),
  );
  return NextResponse.json({ items: filtered, total: cachedApps.length });
};
