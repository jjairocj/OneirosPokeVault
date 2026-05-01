import { describe, it, expect } from 'vitest';
import { validateDeckCards } from '../controllers/decks/validate.js';

describe('deck validation', () => {
  it('valid 60-card deck passes', () => {
    const cards = [
      { cardName: 'Pikachu', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Raichu', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Lightning Energy', quantity: 30, isBasicEnergy: 1 },
      { cardName: 'Professor Research', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Boss Orders', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Ultra Ball', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Nest Ball', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Switch', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Rare Candy', quantity: 2, isBasicEnergy: 0 },
    ];
    const errors = validateDeckCards(cards);
    expect(errors).toHaveLength(0);
  });

  it('rejects deck with wrong size', () => {
    const cards = [{ cardName: 'Pikachu', quantity: 4, isBasicEnergy: 0 }];
    const errors = validateDeckCards(cards);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('size');
  });

  it('rejects more than 4 copies of non-energy card', () => {
    const cards = [
      { cardName: 'Pikachu', quantity: 5, isBasicEnergy: 0 },
      { cardName: 'Lightning Energy', quantity: 55, isBasicEnergy: 1 },
    ];
    const errors = validateDeckCards(cards);
    expect(errors.some((e) => e.type === 'copies')).toBe(true);
    expect(errors[0].details?.['Pikachu']).toBe(5);
  });

  it('allows unlimited basic energy', () => {
    const cards = [
      { cardName: 'Pikachu', quantity: 4, isBasicEnergy: 0 },
      { cardName: 'Lightning Energy', quantity: 56, isBasicEnergy: 1 },
    ];
    const errors = validateDeckCards(cards);
    expect(errors.every((e) => e.type !== 'copies')).toBe(true);
  });

  it('detects both size and copies errors', () => {
    const cards = [
      { cardName: 'Pikachu', quantity: 5, isBasicEnergy: 0 },
    ];
    const errors = validateDeckCards(cards);
    expect(errors.length).toBe(2);
  });
});
