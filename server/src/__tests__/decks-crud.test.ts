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
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

import { db } from '../db/index.js';
import { getDecks, createDeck, getDeck, deleteDeck } from '../controllers/decks/index.js';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { userId: 1, headers: {}, body: {}, params: {}, ...overrides } as AuthRequest;
}

function mockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('decks CRUD', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDecks returns user decks', async () => {
    const decks = [{ id: 1, userId: 1, name: 'My Deck', format: 'standard' }];
    (db.select().from as any).mockReturnThis();
    (db.select().from('').where as any).mockReturnThis();
    (db.select().from('').where('').orderBy as any).mockResolvedValue(decks);

    const req = mockReq();
    const res = mockRes();
    await getDecks(req, res);
    expect(res.json).toHaveBeenCalledWith(decks);
  });

  it('createDeck validates required fields', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await createDeck(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createDeck validates format', async () => {
    const req = mockReq({ body: { name: 'Test', format: 'invalid' } });
    const res = mockRes();
    await createDeck(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createDeck enforces free plan limit', async () => {
    (db as any).where
      .mockReturnValueOnce(db)
      .mockResolvedValueOnce([{}, {}, {}]);
    (db as any).limit.mockResolvedValueOnce([{ plan: 'free' }]);

    const req = mockReq({ body: { name: 'Test', format: 'standard' } });
    const res = mockRes();
    await createDeck(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('getDeck returns 400 for invalid id', async () => {
    const req = mockReq({ params: { id: 'abc' } });
    const res = mockRes();
    await getDeck(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deleteDeck returns 400 for invalid id', async () => {
    const req = mockReq({ params: { id: 'abc' } });
    const res = mockRes();
    await deleteDeck(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
