import { NextRequest } from 'next/server';

const WEBHOOK_SECRET = process.env.AT_WEBHOOK_SECRET;

// AT Voice callback — returns SSML/XML to play when the call connects
export async function POST(req: NextRequest) {
  // Verify shared secret passed as ?secret= query param
  if (WEBHOOK_SECRET) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const body = await req.formData().catch(() => null);
  const sessionId = body?.get('sessionId') ?? '';

  console.log('[Voice webhook] session:', sessionId);

  const ssml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">
    Hello. This is an automated alert from Freight Flow.
    Please check your Freight Flow dashboard for important updates on your shipment.
    Thank you.
  </Say>
</Response>`;

  return new Response(ssml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
