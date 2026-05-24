import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.routes';
import { loadsRouter } from './routes/loads.routes';
import { usersRouter } from './routes/users.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { documentsRouter } from './routes/documents.routes';
import { adminRouter } from './routes/admin.routes';
import { ussdRouter } from './routes/ussd.routes';
import { webhooksRouter } from './routes/webhooks.routes';
import { healthRouter } from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { authRateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/health', healthRouter);
app.use('/api/ussd', ussdRouter);
app.use('/api/webhooks', webhooksRouter);

// Auth routes (with rate limiting)
app.use('/api/auth', authRateLimiter, authRouter);

// Protected routes (JWT required)
app.use('/api/loads', authMiddleware, tenantMiddleware, loadsRouter);
app.use('/api/users', authMiddleware, tenantMiddleware, usersRouter);
app.use('/api/notifications', authMiddleware, tenantMiddleware, notificationsRouter);
app.use('/api/documents', authMiddleware, tenantMiddleware, documentsRouter);
app.use('/api/admin', authMiddleware, tenantMiddleware, adminRouter);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`FreightFlow API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
