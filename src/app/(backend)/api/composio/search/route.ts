import { type NextRequest, NextResponse } from 'next/server';

const POPULAR_SLUGS = [
  'gmail', 'slack', 'github', 'notion', 'googlecalendar', 'googledrive',
  'hubspot', 'salesforce', 'stripe', 'shopify', 'linear', 'asana', 'jira',
  'figma', 'discord', 'zoom', 'trello', 'airtable', 'dropbox', 'gitlab',
  'monday', 'clickup', 'zendesk', 'intercom', 'pipedrive', 'freshdesk',
  'mailchimp', 'sendgrid', 'twilio', 'klaviyo', 'mixpanel', 'amplitude',
  'segment', 'datadog', 'stripe', 'paypal', 'quickbooks', 'xero',
  'outlook', 'one_drive', 'microsoft_teams', 'twitter', 'linkedin',
  'instagram', 'facebook', 'tiktok', 'pinterest', 'reddit', 'wordpress',
  'canvas', 'figma', 'elevenlabs', 'replicate', 'supabase', 'sentry',
  'neon', 'cloudflare', 'bitbucket', 'docusign', 'calendly', 'apollo',
  'attio', 'zoho', 'fireflies', 'posthog', 'heygen', 'bamboohr',
  'dynamics365', 'brevo', 'semrush', 'googlemeet', 'googletasks',
  'googlesheets', 'googledocs', 'googlephotos', 'youtube', 'coinbase',
  'whatsapp', 'monday', 'shortcut', 'confluence', 'wrike', 'coda',
];

const COMPETITOR_SLUGS = ['openai', 'anthropic', 'perplexityai', 'deepseek', 'grok', 'gemini', 'mistral', 'cohere'];

export const GET = async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) {
    const items = POPULAR_SLUGS.map(slug => ({
      category: 'Popular',
      logo: `https://www.google.com/s2/favicons?domain=${slug.replace(/_/g, '')}.com&sz=64`,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' '),
      slug,
    }));
    return NextResponse.json({ items });
  }

  const res = await fetch(
    `https://backend.composio.dev/api/v3/toolkits?search=${encodeURIComponent(q)}&limit=20`,
    { headers: { 'x-api-key': process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk' } },
  );
  const data = await res.json();
  const items = (data.items || []).filter((item: { slug: string }) => !COMPETITOR_SLUGS.includes(item.slug));
  return NextResponse.json({ items });
};
