import { NextResponse } from 'next/server';

export async function POST() {
  // Voice callback placeholder — full IVR implementation in v2
  return NextResponse.json({ received: true });
}
