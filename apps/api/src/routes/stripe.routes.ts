import { Router, type Request, type Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '@erp/db';
import { authenticate } from '../middleware/authenticate.js';
import { logger } from '../lib/logger.js';

export const stripeRouter: Router = Router();

// Lazy Stripe client initialization to avoid crashing server on startup if env var is missing
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(stripeKey);
  }
  return stripeClient;
}

// ─── POST /api/v1/payments/stripe/create-checkout-session ─────────
stripeRouter.post('/create-checkout-session', authenticate, async (req: Request, res: Response, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(503).json({
        ok: false,
        error: { code: 'PAYMENT_NOT_CONFIGURED', message: 'Stripe payment gateway is not configured on this server.' },
      });
      return;
    }
    const stripe = getStripe();

    const { amount, customerName, customerPhone, customerEmail, dueId, saleId, invoiceNumber } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ ok: false, error: { message: 'Invalid payment amount' } });
      return;
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
    const amountInPaise = Math.round(Number(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Shree Jewellers — Payment Settlement',
              description: invoiceNumber ? `Invoice #${invoiceNumber}` : `Settlement for ${customerName || 'Customer'}`,
            },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      success_url: `${frontendUrl}/pos?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pos?stripe_status=cancelled`,
      metadata: {
        dueId: dueId || '',
        saleId: saleId || '',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        invoiceNumber: invoiceNumber || '',
      },
    });

    res.json({
      ok: true,
      data: {
        url: session.url,
        sessionId: session.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/v1/payments/stripe/verify/:sessionId ──────────────
stripeRouter.get('/verify/:sessionId', authenticate, async (req: Request, res: Response, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(503).json({
        ok: false,
        error: { code: 'PAYMENT_NOT_CONFIGURED', message: 'Stripe payment gateway is not configured on this server.' },
      });
      return;
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      ok: true,
      data: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        metadata: session.metadata,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/v1/payments/stripe/webhook ─────────────────────────
// Note: Webhook is unauthenticated because Stripe servers call it
stripeRouter.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).send('Stripe is not configured on this server.');
    return;
  }
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    const rawBody = (req as any).rawBody;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
    } else if (Buffer.isBuffer(rawBody)) {
      event = JSON.parse(rawBody.toString('utf8'));
    } else if (typeof req.body === 'string') {
      event = JSON.parse(req.body);
    } else {
      event = req.body;
    }
  } catch (err: any) {
    logger.error({ err }, 'Stripe webhook verification error');
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { dueId, saleId, customerName } = session.metadata || {};
      const amountPaid = (session.amount_total || 0) / 100;

      logger.info({ sessionId: session.id, amountPaid, dueId, saleId }, 'Stripe payment succeeded');

      // 1. If linked to Customer Due, update balance
      if (dueId) {
        const due = await prisma.customerDue.findUnique({ where: { id: dueId } });
        if (due) {
          const newPaid = Number(due.paidAmount) + amountPaid;
          const newBalance = Math.max(0, Number(due.originalAmount) - newPaid);
          const newStatus = newBalance <= 0 ? 'CLEARED' : 'PARTIAL';

          await prisma.customerDue.update({
            where: { id: dueId },
            data: {
              paidAmount: newPaid,
              balanceAmount: newBalance,
              status: newStatus,
              clearedAt: newStatus === 'CLEARED' ? new Date() : null,
            },
          });
        }
      }

      // 2. If linked to Sale, add Payment record
      if (saleId) {
        await prisma.payment.create({
          data: {
            saleId,
            mode: 'CARD',
            amount: amountPaid,
            reference: `Stripe: ${session.id}`,
          },
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    logger.error({ err }, 'Error handling Stripe webhook event');
    res.status(500).json({ error: 'Failed to process event' });
  }
});
