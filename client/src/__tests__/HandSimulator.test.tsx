import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HandSimulator from '../components/deck/HandSimulator';

describe('HandSimulator', () => {
  it('renders draw button', () => {
    render(<HandSimulator onSimulate={vi.fn().mockResolvedValue(null)} />);
    expect(screen.getByText('Draw Hand')).toBeTruthy();
  });

  it('shows hand cards after simulation', async () => {
    const result = {
      hand: [
        { cardId: '1', cardName: 'Pikachu', cardImage: null },
        { cardId: '2', cardName: 'Lightning Energy', cardImage: null },
      ],
      isMulligan: false,
      deckSize: 60,
    };
    render(<HandSimulator onSimulate={vi.fn().mockResolvedValue(result)} />);
    fireEvent.click(screen.getByText('Draw Hand'));
    await waitFor(() => expect(screen.getByText('Pikachu')).toBeTruthy());
    expect(screen.getByText('Deck: 60 cards')).toBeTruthy();
  });

  it('shows mulligan warning when no basic pokemon', async () => {
    const result = {
      hand: [{ cardId: '1', cardName: 'Lightning Energy', cardImage: null }],
      isMulligan: true,
      deckSize: 60,
    };
    render(<HandSimulator onSimulate={vi.fn().mockResolvedValue(result)} />);
    fireEvent.click(screen.getByText('Draw Hand'));
    await waitFor(() => expect(screen.getByText(/Mulligan/)).toBeTruthy());
  });
});
