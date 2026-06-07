import { type NextRequest, NextResponse } from 'next/server';

import { searchComposioToolkits } from '@/services/composio';

export const GET = async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) return NextResponse.json({ items: [] });
  const items = await searchComposioToolkits(q);
  return NextResponse.json({ items });
};
