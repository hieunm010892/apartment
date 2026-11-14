import { NextResponse } from 'next/server';
import { getMaintenanceTickets } from '@/lib/store';

export async function GET() {
  const data = await getMaintenanceTickets();
  return NextResponse.json(data);
}

