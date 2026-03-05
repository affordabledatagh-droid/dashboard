// app/api/datamart/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.datamartgh.shop/api/developer';
const TOKEN = process.env.DATAMART_TOKEN || '';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'POST');
}

async function proxyRequest(req: NextRequest, pathSegments: string[], method: string) {
  const path = pathSegments.join('/');
  const search = req.nextUrl.searchParams.toString();
  const url = `${API_BASE}/${path}${search ? `?${search}` : ''}`;

  const body = method === 'POST' ? await req.text() : undefined;

  const upstream = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
      'x-api-key': TOKEN,
    },
    body,
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}