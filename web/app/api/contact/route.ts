import { NextRequest, NextResponse } from 'next/server';
import { sms } from '@/lib/services/at';

const SUPPORT_PHONE = process.env.SUPPORT_PHONE;

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Notify support team via SMS if SUPPORT_PHONE is configured
    if (SUPPORT_PHONE) {
      const smsBody = `FreightFlow contact from ${name} (${email}): [${subject ?? 'General'}] ${message.slice(0, 100)}`;
      await sms.send({ to: [SUPPORT_PHONE], message: smsBody }).catch((err: unknown) => {
        console.error('[contact-sms]', err);
      });
    }

    console.info('[contact]', { name, email, phone, subject, messageLength: message.length });

    return NextResponse.json({ success: true, message: 'Message received. We will reply within 24 hours.' });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
