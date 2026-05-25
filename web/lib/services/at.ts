import AfricasTalking from 'africastalking';

if (!process.env.AT_API_KEY) {
  throw new Error('AT_API_KEY env var must be set');
}

const AT = AfricasTalking({
  apiKey:   process.env.AT_API_KEY,
  username: process.env.AT_USERNAME || 'sandbox',
});

export const sms     = AT.SMS;
export const airtime = AT.AIRTIME;
export const voice   = AT.VOICE;

export default AT;
