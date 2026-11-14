import { NextResponse } from 'next/server';
import { getAssets } from '@/lib/store';

export async function GET() {
  const data = await getAssets();
  return NextResponse.json(data);
}
