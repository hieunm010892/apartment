import { NextResponse } from 'next/server';
import { getMeterReadings, saveMeterReading } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const m = searchParams.get('month');
  const y = searchParams.get('year');
  const data = await getMeterReadings(m ? parseInt(m) : undefined, y ? parseInt(y) : undefined);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveMeterReading(body);
  return NextResponse.json(saved);
}
