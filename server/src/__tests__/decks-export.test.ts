import { describe, it, expect } from 'vitest';
import { parsePTCGLiveText } from '../controllers/decks/exportImport.js';

describe('PTCGLive export/import', () => {
  it('parses valid PTCGLive format', () => {
    const text = `4 Pikachu V SIT 49
2 Boss's Orders BRS 132
10 Lightning Energy SVI 257`;
    const cards = parsePTCGLiveText(text);
    expect(cards).toHaveLength(3);
    expect(cards[0]).toEqual({ quantity: 4, name: 'Pikachu V', setCode: 'SIT', number: '49' });
    expect(cards[1]).toEqual({ quantity: 2, name: "Boss's Orders", setCode: 'BRS', number: '132' });
    expect(cards[2]).toEqual({ quantity: 10, name: 'Lightning Energy', setCode: 'SVI', number: '257' });
  });

  it('ignores blank lines', () => {
    const text = `4 Pikachu V SIT 49

2 Raichu V ASR 50
`;
    const cards = parsePTCGLiveText(text);
    expect(cards).toHaveLength(2);
  });

  it('returns empty for unparseable text', () => {
    const text = 'this is not a deck list';
    const cards = parsePTCGLiveText(text);
    expect(cards).toHaveLength(0);
  });

  it('roundtrip format consistency', () => {
    const original = `4 Pikachu V SIT 49`;
    const parsed = parsePTCGLiveText(original);
    const exported = parsed.map((c) => `${c.quantity} ${c.name} ${c.setCode} ${c.number}`).join('\n');
    expect(exported).toBe(original);
  });
});
