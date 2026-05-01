import { describe, it, expect } from 'vitest';

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function hasBasicPokemon(hand: { cardName: string }[]): boolean {
  return hand.some((c) => {
    const name = c.cardName.toLowerCase();
    return !name.includes('energy') && !name.includes('trainer') &&
      !name.includes(' v') && !name.includes(' ex') && !name.includes(' gx') &&
      !name.includes('vmax') && !name.includes('vstar') && !name.includes('mega');
  });
}

describe('deck simulation helpers', () => {
  it('fisherYatesShuffle preserves all cards', () => {
    const cards = Array.from({ length: 60 }, (_, i) => ({ cardId: String(i), cardName: `Card ${i}`, cardImage: null }));
    const shuffled = fisherYatesShuffle(cards);
    expect(shuffled).toHaveLength(60);
    expect(shuffled.map((c) => c.cardId).sort()).toEqual(cards.map((c) => c.cardId).sort());
  });

  it('fisherYatesShuffle does not mutate original', () => {
    const cards = [{ cardId: '1', cardName: 'A', cardImage: null }];
    const original = [...cards];
    fisherYatesShuffle(cards);
    expect(cards).toEqual(original);
  });

  it('hasBasicPokemon detects basic pokemon', () => {
    const hand = [{ cardName: 'Pikachu' }, { cardName: 'Lightning Energy' }];
    expect(hasBasicPokemon(hand)).toBe(true);
  });

  it('hasBasicPokemon returns false for hand with only energy and trainers', () => {
    const hand = [
      { cardName: 'Lightning Energy' },
      { cardName: 'Trainer Card' },
      { cardName: 'Pikachu V' },
      { cardName: 'Charizard ex' },
      { cardName: 'Mewtwo GX' },
      { cardName: 'Rayquaza VMAX' },
      { cardName: 'Arceus VSTAR' },
    ];
    expect(hasBasicPokemon(hand)).toBe(false);
  });

  it('hand draws exactly 7 cards', () => {
    const deck = Array.from({ length: 60 }, (_, i) => ({ cardId: String(i), cardName: `Card ${i}`, cardImage: null }));
    const shuffled = fisherYatesShuffle(deck);
    const hand = shuffled.slice(0, 7);
    expect(hand).toHaveLength(7);
  });
});
