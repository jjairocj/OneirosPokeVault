import { describe, it, expect } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import {
  users, refreshTokens, collections, ownedCards,
  decks, deckCards, lists, listCards,
  priceSnapshots, userProfiles, cardNotes, payments,
} from '../db/schema.js';

describe('Database Schema', () => {
  describe('users table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(users).name).toBe('users');
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
      expect(getTableConfig(refreshTokens).name).toBe('refresh_tokens');
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
      expect(getTableConfig(collections).name).toBe('collections');
    });
    it('should have required columns', () => {
      expect(collections.id).toBeDefined();
      expect(collections.userId).toBeDefined();
      expect(collections.entryName).toBeDefined();
    });
  });

  describe('ownedCards table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(ownedCards).name).toBe('owned_cards');
    });
    it('should have required columns', () => {
      expect(ownedCards.id).toBeDefined();
      expect(ownedCards.userId).toBeDefined();
      expect(ownedCards.cardId).toBeDefined();
    });
  });

  describe('decks table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(decks).name).toBe('decks');
    });
    it('should have required columns', () => {
      expect(decks.id).toBeDefined();
      expect(decks.userId).toBeDefined();
      expect(decks.name).toBeDefined();
      expect(decks.format).toBeDefined();
    });
  });

  describe('deckCards table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(deckCards).name).toBe('deck_cards');
    });
    it('should have required columns', () => {
      expect(deckCards.deckId).toBeDefined();
      expect(deckCards.cardId).toBeDefined();
      expect(deckCards.cardName).toBeDefined();
      expect(deckCards.quantity).toBeDefined();
      expect(deckCards.isBasicEnergy).toBeDefined();
    });
  });

  describe('lists table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(lists).name).toBe('lists');
    });
    it('should have required columns', () => {
      expect(lists.userId).toBeDefined();
      expect(lists.name).toBeDefined();
      expect(lists.listType).toBeDefined();
      expect(lists.visibility).toBeDefined();
      expect(lists.shareSlug).toBeDefined();
    });
  });

  describe('listCards table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(listCards).name).toBe('list_cards');
    });
    it('should have required columns', () => {
      expect(listCards.listId).toBeDefined();
      expect(listCards.cardId).toBeDefined();
      expect(listCards.quantity).toBeDefined();
    });
  });

  describe('priceSnapshots table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(priceSnapshots).name).toBe('price_snapshots');
    });
    it('should have required columns', () => {
      expect(priceSnapshots.cardId).toBeDefined();
      expect(priceSnapshots.source).toBeDefined();
      expect(priceSnapshots.price).toBeDefined();
      expect(priceSnapshots.currency).toBeDefined();
    });
  });

  describe('userProfiles table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(userProfiles).name).toBe('user_profiles');
    });
    it('should have required columns', () => {
      expect(userProfiles.userId).toBeDefined();
      expect(userProfiles.displayName).toBeDefined();
      expect(userProfiles.featuredCards).toBeDefined();
    });
  });

  describe('cardNotes table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(cardNotes).name).toBe('card_notes');
    });
    it('should have required columns', () => {
      expect(cardNotes.userId).toBeDefined();
      expect(cardNotes.cardId).toBeDefined();
      expect(cardNotes.note).toBeDefined();
    });
  });

  describe('payments table', () => {
    it('should have the correct table name', () => {
      expect(getTableConfig(payments).name).toBe('payments');
    });
    it('should have required columns', () => {
      expect(payments.userId).toBeDefined();
      expect(payments.amount).toBeDefined();
      expect(payments.currency).toBeDefined();
      expect(payments.provider).toBeDefined();
      expect(payments.status).toBeDefined();
    });
  });
});
