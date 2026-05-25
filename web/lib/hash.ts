import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10;

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const hashOTP = (otp: string) => bcrypt.hash(otp, 10);
export const compareOTP = (otp: string, hash: string) => bcrypt.compare(otp, hash);
