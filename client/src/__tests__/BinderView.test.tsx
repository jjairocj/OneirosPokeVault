import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BinderView from '../components/pro/BinderView';

const makeCards = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    cardId: `card-${i}`,
    cardName: `Card ${i}`,
    image: undefined,
    quantity: 1,
  }));

describe('BinderView', () => {
  it('renders 9 slots per page', () => {
    const { container } = render(<BinderView cards={makeCards(5)} />);
    const slots = container.querySelectorAll('[class*="aspect-"]');
    expect(slots.length).toBe(9);
  });

  it('shows card quantity badge when quantity > 1', () => {
    const cards = [{ cardId: 'c1', cardName: 'Pikachu', image: undefined, quantity: 3 }];
    render(<BinderView cards={cards} />);
    expect(screen.getByText('×3')).toBeTruthy();
  });

  it('shows pagination when more than 9 cards', () => {
    render(<BinderView cards={makeCards(10)} />);
    expect(screen.getByText(/Page 1 \/ 2/)).toBeTruthy();
  });

  it('does not show pagination for 9 or fewer cards', () => {
    render(<BinderView cards={makeCards(9)} />);
    expect(screen.queryByText(/Page/)).toBeNull();
  });

  it('navigates to next page on Next click', () => {
    render(<BinderView cards={makeCards(10)} />);
    fireEvent.click(screen.getByText('Next →'));
    expect(screen.getByText('Page 2 / 2')).toBeTruthy();
  });

  it('calls onCardClick when a card slot is clicked', () => {
    const onCardClick = vi.fn();
    const cards = [{ cardId: 'c1', cardName: 'Pikachu', image: undefined, quantity: 1 }];
    render(<BinderView cards={cards} onCardClick={onCardClick} />);
    const slots = document.querySelectorAll('[class*="aspect-"]');
    fireEvent.click(slots[0]);
    expect(onCardClick).toHaveBeenCalledWith('c1');
  });
});
