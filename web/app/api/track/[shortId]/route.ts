import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint — no auth required.
// Returns read-only tracking data for sharing with cargo recipients.
// Deliberately excludes phone numbers and transporter personal details.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> },
) {
  const { shortId } = await params;

  const load = await prisma.load.findFirst({
    where: { shortId },
    select: {
      id: true,
      shortId: true,
      status: true,
      origin: true,
      destination: true,
      cargoType: true,
      weight: true,
      deliveryDate: true,
      notes: true,
      lastLocation: true,
      acceptedAt: true,
      pickedUpAt: true,
      inTransitAt: true,
      deliveredAt: true,
      confirmedAt: true,
      createdAt: true,
      shipper: {
        select: { company: true, name: true },
      },
      transporter: {
        select: { vehicleType: true, numberPlate: true },
      },
      statusLogs: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          status: true,
          channel: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!load) {
    return NextResponse.json(
      { success: false, error: 'Tracking ID not found. Check the ID and try again.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: load });
}
