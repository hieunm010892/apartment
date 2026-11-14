import { NextResponse } from 'next/server';
import { getInvoiceById, saveInvoice } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const inv = await getInvoiceById(id);
  if (!inv) {
    return NextResponse.json({ message: 'Không tìm thấy hóa đơn' }, { status: 404 });
  }
  return NextResponse.json(inv);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const saved = await saveInvoice({ ...body, invoice_id: id });
    return NextResponse.json({ success: true, invoice: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

