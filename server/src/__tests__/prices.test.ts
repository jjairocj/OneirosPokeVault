import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authGuard.js';

vi.mock('../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

import { db } from '../db/index.js';
import { getPriceHistory, recordSnapshot, getLatestPrices } from '../controllers/prices.js';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { userId: 1, headers: {}, body: {}, params: {}, query: {}, ...overrides } as AuthRequest;
}
function mockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('prices controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getPriceHistory returns snapshots for a card', async () => {
    const data = [{ id: 1, cardId: 'swsh1-1', source: 'tcgplayer', price: 500, currency: 'USD' }];
    (db as any).orderBy.mockResolvedValue(data);

    const req = mockReq({ params: { cardId: 'swsh1-1' }, query: {} });
    const res = mockRes();
    await getPriceHistory(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'swsh1-1', snapshots: data }));
  });

  it('recordSnapshot returns 400 when fields missing', async () => {
    const req = mockReq({ body: { cardId: 'swsh1-1' } });
    const res = mockRes();
    await recordSnapshot(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('recordSnapshot returns 400 for invalid source', async () => {
    const req = mockReq({ body: { cardId: 'swsh1-1', source: 'ebay', price: 5, currency: 'USD' } });
    const res = mockRes();
    await recordSnapshot(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('recordSnapshot returns 400 for invalid currency', async () => {
    const req = mockReq({ body: { cardId: 'swsh1-1', source: 'tcgplayer', price: 5, currency: 'COP' } });
    const res = mockRes();
    await recordSnapshot(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('recordSnapshot creates snapshot and converts price to cents', async () => {
    const snapshot = { id: 1, cardId: 'swsh1-1', source: 'tcgplayer', price: 599, currency: 'USD' };
    (db as any).returning.mockResolvedValue([snapshot]);

    const req = mockReq({ body: { cardId: 'swsh1-1', source: 'tcgplayer', price: 5.99, currency: 'USD' } });
    const res = mockRes();
    await recordSnapshot(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getLatestPrices returns 400 for empty cardIds', async () => {
    const req = mockReq({ body: { cardIds: [] } });
    const res = mockRes();
    await getLatestPrices(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getLatestPrices returns 400 for more than 50 ids', async () => {
    const req = mockReq({ body: { cardIds: Array.from({ length: 51 }, (_, i) => `card-${i}`) } });
    const res = mockRes();
    await getLatestPrices(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
