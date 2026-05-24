import { Router, Request, Response } from 'express';
import { handleUSSD } from '../controllers/ussd.controller';

export const ussdRouter = Router();

// AT sends POST with URL-encoded body — no JWT required (IP whitelist on AT side)
ussdRouter.post('/', handleUSSD);
