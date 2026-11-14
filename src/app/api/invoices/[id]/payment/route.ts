import { NextResponse } from 'next/server';
import { recordPayment } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);
    const { amount, paymentMethod, notes } = await request.json();
    const updated = await recordPayment(invoiceId, amount, paymentMethod, notes);
    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

