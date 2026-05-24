import AfricasTalking from 'africastalking';

const AT = AfricasTalking({
  apiKey: process.env.AT_API_KEY || '',
  username: process.env.AT_USERNAME || 'sandbox',
});

export const sms = AT.SMS;
export const airtime = AT.AIRTIME;

export default AT;
