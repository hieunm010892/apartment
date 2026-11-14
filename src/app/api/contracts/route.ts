import { NextResponse } from 'next/server';
import { getContracts, saveContract } from '@/lib/store';

export async function GET() {
  const data = await getContracts();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveContract(body);
  return NextResponse.json(saved);
}

