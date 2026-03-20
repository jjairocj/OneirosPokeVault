import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCards } from '../hooks/useCards';

const { mockQuery, mockCardList, mockSetGet } = vi.hoisted(() => {
  const mockQuery = {
    like: vi.fn().mockReturnThis(),
    equal: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    paginate: vi.fn().mockReturnThis(),
  };
  return {
    mockQuery,
    mockCardList: vi.fn(),
    mockSetGet: vi.fn(),
  };
});

vi.mock('@tcgdex/sdk', () => ({
  Query: { create: vi.fn(() => mockQuery) },
}));

vi.mock('../lib/tcgdex', () => ({
  default: {
    card: { list: mockCardList, get: vi.fn() },
    set: { get: mockSetGet },
  },
}));

const makeCard = (id: string, name: string) => ({
  id,
  localId: id.split('-')[1],
  name,
  image: `https://example.com/${id}`,
  getImageURL: () => `https://example.com/${id}/low.webp`,
});

describe('useCards - searchByIllustrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.like.mockReturnThis();
    mockQuery.equal.mockReturnThis();
    mockQuery.sort.mockReturnThis();
    mockQuery.paginate.mockReturnThis();
  });

  it('should return mapped cards from API result', async () => {
    const mockCards = [makeCard('swsh1-1', 'Celebi V'), makeCard('swsh1-2', 'Pikachu')];
    mockCardList.mockResolvedValue(mockCards);

    const { result } = renderHook(() => useCards());
    await act(async () => {
      await result.current.searchByIllustrator('Mitsuhiro Arita');
    });

    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards[0]).toMatchObject({ id: 'swsh1-1', name: 'Celebi V' });
    expect(result.current.cards[1]).toMatchObject({ id: 'swsh1-2', name: 'Pikachu' });
  });

  it('should query using equal filter on illustrator field', async () => {
    mockCardList.mockResolvedValue([]);
    const { result } = renderHook(() => useCards());

    await act(async () => {
      await result.current.searchByIllustrator('PLANETA Igarashi');
    });

    expect(mockQuery.equal).toHaveBeenCalledWith('illustrator', 'PLANETA Igarashi');
    expect(mockQuery.sort).toHaveBeenCalledWith('localId', 'ASC');
  });

  it('should set empty cards without calling API for empty name', async () => {
    const { result } = renderHook(() => useCards());

    await act(async () => {
      await result.current.searchByIllustrator('');
    });

    expect(result.current.cards).toHaveLength(0);
    expect(mockCardList).not.toHaveBeenCalled();
  });

  it('should set loading true during fetch and false after', async () => {
    let resolveCards!: (v: any) => void;
    mockCardList.mockReturnValue(new Promise((r) => { resolveCards = r; }));

    const { result } = renderHook(() => useCards());

    act(() => { result.current.searchByIllustrator('Mitsuhiro Arita'); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolveCards([]); });
    expect(result.current.loading).toBe(false);
  });

  it('should set empty cards when API returns null', async () => {
    mockCardList.mockResolvedValue(null);
    const { result } = renderHook(() => useCards());

    await act(async () => {
      await result.current.searchByIllustrator('Unknown Artist');
    });

    expect(result.current.cards).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('should set error message on API failure', async () => {
    mockCardList.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useCards());

    await act(async () => {
      await result.current.searchByIllustrator('Mitsuhiro Arita');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.cards).toHaveLength(0);
  });

  it('should trim whitespace from illustrator name', async () => {
    mockCardList.mockResolvedValue([]);
    const { result } = renderHook(() => useCards());

    await act(async () => {
      await result.current.searchByIllustrator('  Mitsuhiro Arita  ');
    });

    expect(mockQuery.equal).toHaveBeenCalledWith('illustrator', 'Mitsuhiro Arita');
  });
});
