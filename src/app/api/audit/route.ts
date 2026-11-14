import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/store';

export async function GET() {
  const data = await getAuditLogs();
  return NextResponse.json(data);
}
