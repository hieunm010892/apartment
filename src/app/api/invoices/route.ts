import { NextResponse } from 'next/server';
import { getInvoices, saveInvoice } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const m = searchParams.get('month');
  const y = searchParams.get('year');
  const data = await getInvoices(m ? parseInt(m) : undefined, y ? parseInt(y) : undefined);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = await saveInvoice(body);
    return NextResponse.json({ success: true, invoice: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

