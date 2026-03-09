import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setAccessToken, getAccessToken } from '../lib/api';

describe('api module', () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it('should store and retrieve access token', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('test-token-123');
    expect(getAccessToken()).toBe('test-token-123');
  });

  it('should clear access token', () => {
    setAccessToken('test-token');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});
