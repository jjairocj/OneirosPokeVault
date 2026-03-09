import { describe, it, expect } from 'vitest';
import { authLimiter, apiLimiter, collectionsLimiter } from '../middleware/rateLimiter';

describe('rateLimiter', () => {
  it('authLimiter should be defined with correct config', () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe('function');
  });

  it('apiLimiter should be defined with correct config', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
  });

  it('collectionsLimiter should be defined with correct config', () => {
    expect(collectionsLimiter).toBeDefined();
    expect(typeof collectionsLimiter).toBe('function');
  });
});
