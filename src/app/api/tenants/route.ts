import { NextResponse } from 'next/server';
import { getTenants, saveTenant } from '@/lib/store';

export async function GET() {
  const data = await getTenants();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveTenant(body);
  return NextResponse.json(saved);
}

