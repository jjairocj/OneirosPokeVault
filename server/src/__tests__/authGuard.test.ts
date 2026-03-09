import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard, AuthRequest } from '../middleware/authGuard.js';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

function mockReq(headers: Record<string, string> = {}): AuthRequest {
  return { headers } as AuthRequest;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('authGuard', () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no authorization header', () => {
    const req = mockReq();
    const res = mockRes();

    authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', () => {
    const req = mockReq({ authorization: 'Basic abc123' });
    const res = mockRes();

    authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 with TOKEN_EXPIRED code for expired tokens', () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '0s',
    } as jwt.SignOptions);

    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    // Token is already expired
    authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
  });

  it('should return 401 for invalid tokens', () => {
    const req = mockReq({ authorization: 'Bearer invalid_token' });
    const res = mockRes();

    authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should call next and set userId for valid tokens', () => {
    const token = jwt.sign({ userId: 42 }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: '15m',
    } as jwt.SignOptions);

    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(42);
  });
});
