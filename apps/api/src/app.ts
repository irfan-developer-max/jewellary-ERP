import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from './lib/logger.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { vendorRouter } from './routes/vendor.routes.js';
import { saleRouter } from './routes/sale.routes.js';
import { customerRouter } from './routes/customer.routes.js';
import { dueRouter } from './routes/due.routes.js';
import { stockMovementRouter } from './routes/stockMovement.routes.js';
import { auditLogRouter } from './routes/auditLog.routes.js';
import { reportRouter } from './routes/report.routes.js';
import { stripeRouter } from './routes/stripe.routes.js';

export const app: Express = express();

// Trust proxy in production (Render, Railway, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Global middleware
app.use(requestId);
app.use(pinoHttp);
// Parse allowed origins, strip trailing slashes, and support comma-separated lists
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-to-server, health checks)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

// Capture rawBody for Stripe Webhook signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'healthy' } });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/sales', saleRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/dues', dueRouter);
app.use('/api/v1/stock-movements', stockMovementRouter);
app.use('/api/v1/audit-log', auditLogRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/payments/stripe', stripeRouter);

// Global error handler (must be last)
app.use(errorHandler);
