#!/usr/bin/env node
/**
 * Verify Africa's Talking sandbox connection.
 * Usage:  node scripts/test-at.js +254712345678
 * Run from the /web directory after setting AT_API_KEY in .env.local
 */
require('dotenv').config({ path: '.env.local' });
const AfricasTalking = require('africastalking');

const phone = process.argv[2];
if (!phone) {
  console.error('Usage: node scripts/test-at.js +254712345678');
  process.exit(1);
}

if (!process.env.AT_API_KEY || process.env.AT_API_KEY.includes('your_at')) {
  console.error('❌  AT_API_KEY not set. Edit .env.local and replace the placeholder.');
  process.exit(1);
}

const AT = AfricasTalking({
  apiKey:   process.env.AT_API_KEY,
  username: process.env.AT_USERNAME || 'sandbox',
});

async function main() {
  console.log(`\n🔌  Connecting to AT [${process.env.AT_USERNAME}] environment...`);

  // ── SMS test ──────────────────────────────────────────────────────────────
  console.log(`\n📱  Sending test SMS to ${phone}...`);
  try {
    const res = await AT.SMS.send({
      to:      [phone],
      message: 'FreightFlow: AT sandbox connection verified. SMS API working ✓',
      from:    process.env.AT_SENDER_ID || 'FreightFlow',
    });
    const r = res.SMSMessageData?.Recipients?.[0];
    if (r?.status === 'Success') {
      console.log(`   ✅  SMS queued — messageId: ${r.messageId}, cost: ${r.cost}`);
    } else {
      console.log(`   ⚠️   SMS status: ${r?.status} (${r?.statusCode})`);
    }
  } catch (e) {
    console.error(`   ❌  SMS failed: ${e.message}`);
  }

  // ── Airtime test (sandbox — no real debit) ────────────────────────────────
  console.log(`\n💰  Testing Airtime API (sandbox — no real debit)...`);
  try {
    const res = await AT.AIRTIME.send({
      recipients: [{ phoneNumber: phone, amount: 'KES 1' }],
    });
    const r = res.responses?.[0];
    console.log(`   ${r?.status === 'Success' ? '✅' : '⚠️ '} Airtime: ${r?.status}`);
  } catch (e) {
    console.error(`   ❌  Airtime failed: ${e.message}`);
  }

  console.log('\n✅  AT configuration test complete.\n');
}

main();
