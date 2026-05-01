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
    onConflictDoUpdate: vi.fn().mockReturnThis(),
  },
}));

vi.mock('nanoid', () => ({ nanoid: () => 'test-slug-xx' }));

import { db } from '../db/index.js';
import { getLists, createList, getList, deleteList } from '../controllers/lists/index.js';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { userId: 1, headers: {}, body: {}, params: {}, ...overrides } as AuthRequest;
}
function mockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('lists CRUD', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getLists returns user lists', async () => {
    const data = [{ id: 1, userId: 1, name: 'Wishlist', listType: 'wishlist' }];
    (db as any).orderBy.mockResolvedValue(data);

    const req = mockReq();
    const res = mockRes();
    await getLists(req, res);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  it('createList returns 400 when name missing', async () => {
    const req = mockReq({ body: { listType: 'wishlist' } });
    const res = mockRes();
    await createList(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createList returns 400 when listType invalid', async () => {
    const req = mockReq({ body: { name: 'Test', listType: 'invalid' } });
    const res = mockRes();
    await createList(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createList creates list with shareSlug for public lists', async () => {
    const list = { id: 1, name: 'My Wishlist', visibility: 'public', shareSlug: 'test-slug-xx' };
    (db as any).returning.mockResolvedValue([list]);

    const req = mockReq({ body: { name: 'My Wishlist', listType: 'wishlist', visibility: 'public' } });
    const res = mockRes();
    await createList(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(list);
  });

  it('getList returns 400 for invalid id', async () => {
    const req = mockReq({ params: { id: 'abc' } });
    const res = mockRes();
    await getList(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deleteList returns 400 for invalid id', async () => {
    const req = mockReq({ params: { id: 'abc' } });
    const res = mockRes();
    await deleteList(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
