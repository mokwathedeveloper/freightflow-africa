import { Router } from 'express';
import {
  register,
  sendOTP,
  verifyOTP,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
