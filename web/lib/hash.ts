import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const hashOTP = (otp: string) => bcrypt.hash(otp, 10);
export const compareOTP = (otp: string, hash: string) => bcrypt.compare(otp, hash);
