import { Router } from 'express';
import { getMe, updateMe } from '../controllers/users.controller';

export const usersRouter = Router();

usersRouter.get('/me', getMe);
usersRouter.patch('/me', updateMe);
