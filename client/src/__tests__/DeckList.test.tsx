import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeckList from '../components/deck/DeckList';
import { Deck } from '../hooks/useDecks';

const mockDecks: Deck[] = [
  { id: 1, userId: 1, name: 'Pikachu Deck', format: 'standard', description: null, createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, name: 'Charizard Deck', format: 'expanded', description: null, createdAt: '', updatedAt: '' },
];

describe('DeckList', () => {
  it('renders deck names', () => {
    render(<DeckList decks={mockDecks} activeDeckId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />);
    expect(screen.getByText('Pikachu Deck')).toBeTruthy();
    expect(screen.getByText('Charizard Deck')).toBeTruthy();
  });

  it('calls onSelect when a deck is clicked', () => {
    const onSelect = vi.fn();
    render(<DeckList decks={mockDecks} activeDeckId={null} onSelect={onSelect} onDelete={vi.fn()} onNew={vi.fn()} />);
    fireEvent.click(screen.getByText('Pikachu Deck'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('shows empty state when no decks', () => {
    render(<DeckList decks={[]} activeDeckId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />);
    expect(screen.getByText('No decks yet')).toBeTruthy();
  });

  it('shows new deck form when + New is clicked', () => {
    render(<DeckList decks={[]} activeDeckId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />);
    fireEvent.click(screen.getByText('+ New'));
    expect(screen.getByPlaceholderText('Deck name')).toBeTruthy();
  });

  it('calls onNew with name and format on submit', () => {
    const onNew = vi.fn();
    render(<DeckList decks={[]} activeDeckId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={onNew} />);
    fireEvent.click(screen.getByText('+ New'));
    fireEvent.change(screen.getByPlaceholderText('Deck name'), { target: { value: 'My Deck' } });
    fireEvent.click(screen.getByText('Create'));
    expect(onNew).toHaveBeenCalledWith('My Deck', 'standard');
  });
});
