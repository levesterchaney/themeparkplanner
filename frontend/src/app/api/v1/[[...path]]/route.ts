import { NextRequest, NextResponse } from 'next/server';

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL || 'http://localhost:8000';

async function handler(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const url = `${API_INTERNAL_URL}${pathname}${search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    duplex: 'half',
  } as RequestInit);

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
