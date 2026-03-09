import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authGuard';

// Mock the database
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
    delete: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
  },
}));

import { db } from '../db';
import { getOwnedCards, addOwnedCard, removeOwnedCard } from '../controllers/ownedCards';
import { getCollections, createCollection } from '../controllers/collections';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    userId: 1,
    headers: {},
    body: {},
    params: {},
    ...overrides,
  } as AuthRequest;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('ownedCards controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOwnedCards', () => {
    it('should return owned cards for the user', async () => {
      const cards = [{ id: 1, userId: 1, cardId: 'base4-1', createdAt: new Date() }];
      (db.select().from as any).mockReturnThis();
      (db.select().from('').where as any).mockReturnThis();
      (db.select().from('').where('').orderBy as any).mockResolvedValue(cards);

      const req = mockReq();
      const res = mockRes();

      await getOwnedCards(req, res);

      expect(res.json).toHaveBeenCalledWith(cards);
    });
  });

  describe('addOwnedCard', () => {
    it('should return 400 if card_id is missing', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await addOwnedCard(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'card_id is required' });
    });

    it('should return 400 if card_id is not a string', async () => {
      const req = mockReq({ body: { card_id: 123 } });
      const res = mockRes();

      await addOwnedCard(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('removeOwnedCard', () => {
    it('should return 404 if card not found', async () => {
      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const req = mockReq({ params: { card_id: 'nonexistent' } });
      const res = mockRes();

      await removeOwnedCard(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

describe('collections controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCollections', () => {
    it('should return collections for the user', async () => {
      const colls = [{ id: 1, userId: 1, entryName: 'Pikachu', createdAt: new Date() }];
      (db.select().from as any).mockReturnThis();
      (db.select().from('').where as any).mockReturnThis();
      (db.select().from('').where('').orderBy as any).mockResolvedValue(colls);

      const req = mockReq();
      const res = mockRes();

      await getCollections(req, res);

      expect(res.json).toHaveBeenCalledWith(colls);
    });
  });

  describe('createCollection', () => {
    it('should return 400 if entry_name is missing', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await createCollection(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'entry_name is required' });
    });

    it('should return 400 if entry_name is empty', async () => {
      const req = mockReq({ body: { entry_name: '   ' } });
      const res = mockRes();

      await createCollection(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 403 if free plan limit reached', async () => {
      // Mock user query
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };
      // First call: get user -> free plan
      selectChain.limit.mockResolvedValueOnce([{ id: 1, plan: 'free' }]);
      // Second call: get existing collections -> 3 entries
      (db.select as any).mockReturnValueOnce(selectChain);

      const selectChain2 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{}, {}, {}]),
      };
      (db.select as any).mockReturnValueOnce(selectChain2);

      const req = mockReq({ body: { entry_name: 'Charizard' } });
      const res = mockRes();

      await createCollection(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'PLAN_LIMIT' })
      );
    });
  });
});
