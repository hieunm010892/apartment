import { NextResponse } from 'next/server';
import { getCashTransactions, saveCashTransaction } from '@/lib/store';

export async function GET() {
  const data = await getCashTransactions();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveCashTransaction(body);
  return NextResponse.json(saved);
}

