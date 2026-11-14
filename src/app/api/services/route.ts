import { NextResponse } from 'next/server';
import { getServices } from '@/lib/store';

export async function GET() {
  const data = await getServices();
  return NextResponse.json(data);
}
