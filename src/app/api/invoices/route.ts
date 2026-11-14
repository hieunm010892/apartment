import { NextResponse } from 'next/server';
import { getInvoices } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const m = searchParams.get('month');
  const y = searchParams.get('year');
  const data = await getInvoices(m ? parseInt(m) : undefined, y ? parseInt(y) : undefined);
  return NextResponse.json(data);
}

