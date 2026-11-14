import { NextResponse } from 'next/server';
import { getBuildings, saveBuilding } from '@/lib/store';

export async function GET() {
  const data = await getBuildings();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveBuilding(body);
  return NextResponse.json(saved);
}
