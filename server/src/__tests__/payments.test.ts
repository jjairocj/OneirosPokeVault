import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authGuard.js';

vi.mock('../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

import { db } from '../db/index.js';
import { initiatePayment, getPaymentStatus, handleWebhook } from '../controllers/payments/index.js';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { userId: 1, headers: {}, body: {}, params: {}, ...overrides } as AuthRequest;
}
function mockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('payments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('initiatePayment returns 400 for invalid plan', async () => {
    const req = mockReq({ body: { plan: 'invalid_plan' } });
    const res = mockRes();
    await initiatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('initiatePayment returns 400 when plan missing', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await initiatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('initiatePayment creates payment and returns checkout url for COP plan', async () => {
    const payment = { id: 42, userId: 1, amount: 1990000, currency: 'COP', provider: 'bold', status: 'pending' };
    (db as any).returning.mockResolvedValue([payment]);

    const req = mockReq({ body: { plan: 'pro_monthly_cop' } });
    const res = mockRes();
    await initiatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const call = (res.json as any).mock.calls[0][0];
    expect(call.paymentId).toBe(42);
    expect(call.provider).toBe('bold');
    expect(call.checkoutUrl).toContain('paymentId=42');
  });

  it('initiatePayment creates payment for USD plan via stripe', async () => {
    const payment = { id: 7, userId: 1, amount: 499, currency: 'USD', provider: 'stripe', status: 'pending' };
    (db as any).returning.mockResolvedValue([payment]);

    const req = mockReq({ body: { plan: 'pro_monthly_usd' } });
    const res = mockRes();
    await initiatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const call = (res.json as any).mock.calls[0][0];
    expect(call.provider).toBe('stripe');
  });

  it('getPaymentStatus returns 400 for invalid id', async () => {
    const req = mockReq({ params: { id: 'abc' } });
    const res = mockRes();
    await getPaymentStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handleWebhook returns 400 when paymentId missing', async () => {
    const req = mockReq({ body: { status: 'completed' } });
    const res = mockRes();
    await handleWebhook(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handleWebhook returns 400 for invalid status', async () => {
    const payment = { id: 1, userId: 5, status: 'pending', externalId: null };
    (db as any).limit.mockResolvedValueOnce([payment]);

    const req = mockReq({ body: { paymentId: '1', status: 'refunded' } });
    const res = mockRes();
    await handleWebhook(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handleWebhook upgrades user to pro on completed', async () => {
    const payment = { id: 1, userId: 5, status: 'pending', externalId: null };
    (db as any).limit.mockResolvedValueOnce([payment]);

    const req = mockReq({ body: { paymentId: '1', status: 'completed', externalId: 'ext-123' } });
    const res = mockRes();
    await handleWebhook(req, res);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
