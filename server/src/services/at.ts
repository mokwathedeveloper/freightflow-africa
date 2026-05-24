import AfricasTalking from 'africastalking';

// Singleton AT SDK instance
const AT = AfricasTalking({
  apiKey: process.env.AT_API_KEY || '',
  username: process.env.AT_USERNAME || 'sandbox',
});

export const sms = AT.SMS;
export const ussd = AT.USSD;
export const voice = AT.VOICE;
export const airtime = AT.AIRTIME;

export default AT;
