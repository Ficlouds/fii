import { NextResponse } from 'next/server';

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5679';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

export async function GET() {
  try {
    const res = await fetch(`${N8N_BASE_URL}/api/v1/workflows?limit=50`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });
    const data = await res.json();
    return NextResponse.json({ flows: data.data || [] });
  } catch {
    return NextResponse.json({ flows: [] });
  }
}
