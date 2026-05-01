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
    delete: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
  },
}));

import { db } from '../db/index.js';
import { getProfile, upsertProfile } from '../controllers/profiles.js';
import { getNote, upsertNote, deleteNote } from '../controllers/cardNotes.js';

function mockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return { userId: 1, headers: {}, body: {}, params: {}, ...overrides } as AuthRequest;
}
function mockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('profiles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getProfile returns empty profile when none exists', async () => {
    (db as any).limit.mockResolvedValue([]);
    const req = mockReq();
    const res = mockRes();
    await getProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ userId: 1, displayName: null }));
  });

  it('getProfile returns existing profile', async () => {
    const profile = { id: 1, userId: 1, displayName: 'Trainer Red', bannerImage: null, featuredCards: null };
    (db as any).limit.mockResolvedValue([profile]);
    const req = mockReq();
    const res = mockRes();
    await getProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(profile);
  });

  it('upsertProfile returns 400 for non-string displayName', async () => {
    const req = mockReq({ body: { displayName: 123 } });
    const res = mockRes();
    await upsertProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('upsertProfile returns 400 when featuredCards exceeds 8', async () => {
    const req = mockReq({ body: { featuredCards: Array.from({ length: 9 }, (_, i) => `card-${i}`) } });
    const res = mockRes();
    await upsertProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('upsertProfile saves valid profile', async () => {
    const profile = { id: 1, userId: 1, displayName: 'Red', bannerImage: null, featuredCards: null };
    (db as any).returning.mockResolvedValue([profile]);
    const req = mockReq({ body: { displayName: 'Red' } });
    const res = mockRes();
    await upsertProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(profile);
  });
});

describe('card notes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getNote returns null when no note exists', async () => {
    (db as any).limit.mockResolvedValue([]);
    const req = mockReq({ params: { cardId: 'swsh1-1' } });
    const res = mockRes();
    await getNote(req, res);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it('upsertNote returns 400 when note is empty', async () => {
    const req = mockReq({ params: { cardId: 'swsh1-1' }, body: { note: '' } });
    const res = mockRes();
    await upsertNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('upsertNote returns 400 when note exceeds 1000 chars', async () => {
    const req = mockReq({ params: { cardId: 'swsh1-1' }, body: { note: 'a'.repeat(1001) } });
    const res = mockRes();
    await upsertNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('upsertNote saves valid note', async () => {
    const note = { id: 1, userId: 1, cardId: 'swsh1-1', note: 'My note' };
    (db as any).returning.mockResolvedValue([note]);
    const req = mockReq({ params: { cardId: 'swsh1-1' }, body: { note: 'My note' } });
    const res = mockRes();
    await upsertNote(req, res);
    expect(res.json).toHaveBeenCalledWith(note);
  });

  it('deleteNote returns 404 when note not found', async () => {
    (db as any).returning.mockResolvedValue([]);
    const req = mockReq({ params: { cardId: 'swsh1-1' } });
    const res = mockRes();
    await deleteNote(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
