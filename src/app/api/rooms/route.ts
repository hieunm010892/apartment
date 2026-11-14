import { NextResponse } from 'next/server';
import { getRooms, saveRoom } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buildingId = searchParams.get('buildingId');
  const data = await getRooms(buildingId ? parseInt(buildingId) : undefined);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveRoom(body);
  return NextResponse.json(saved);
}

