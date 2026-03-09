import { describe, it, expect } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { users, refreshTokens, collections, ownedCards } from '../db/schema.js';

describe('Database Schema', () => {
  describe('users table', () => {
    it('should have the correct table name', () => {
      const config = getTableConfig(users);
      expect(config.name).toBe('users');
    });

    it('should have required columns', () => {
      expect(users.id).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.password).toBeDefined();
      expect(users.plan).toBeDefined();
      expect(users.createdAt).toBeDefined();
    });
  });

  describe('refreshTokens table', () => {
    it('should have the correct table name', () => {
      const config = getTableConfig(refreshTokens);
      expect(config.name).toBe('refresh_tokens');
    });

    it('should have required columns', () => {
      expect(refreshTokens.id).toBeDefined();
      expect(refreshTokens.userId).toBeDefined();
      expect(refreshTokens.token).toBeDefined();
      expect(refreshTokens.expiresAt).toBeDefined();
    });
  });

  describe('collections table', () => {
    it('should have the correct table name', () => {
      const config = getTableConfig(collections);
      expect(config.name).toBe('collections');
    });

    it('should have required columns', () => {
      expect(collections.id).toBeDefined();
      expect(collections.userId).toBeDefined();
      expect(collections.entryName).toBeDefined();
      expect(collections.createdAt).toBeDefined();
    });
  });

  describe('ownedCards table', () => {
    it('should have the correct table name', () => {
      const config = getTableConfig(ownedCards);
      expect(config.name).toBe('owned_cards');
    });

    it('should have required columns', () => {
      expect(ownedCards.id).toBeDefined();
      expect(ownedCards.userId).toBeDefined();
      expect(ownedCards.cardId).toBeDefined();
      expect(ownedCards.createdAt).toBeDefined();
    });
  });
});
