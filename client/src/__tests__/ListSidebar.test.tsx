import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListSidebar from '../components/lists/ListSidebar';
import { CardList } from '../hooks/useLists';

const mockLists: CardList[] = [
  { id: 1, userId: 1, name: 'My Wishlist', listType: 'wishlist', visibility: 'private', shareSlug: null, createdAt: '' },
  { id: 2, userId: 1, name: 'Trade Binder', listType: 'trade_binder', visibility: 'public', shareSlug: 'abc123', createdAt: '' },
];

describe('ListSidebar', () => {
  it('renders list names', () => {
    render(<ListSidebar lists={mockLists} activeListId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />);
    expect(screen.getAllByText(/My Wishlist/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trade Binder/).length).toBeGreaterThan(0);
  });

  it('calls onSelect when a list is clicked', () => {
    const onSelect = vi.fn();
    render(<ListSidebar lists={mockLists} activeListId={null} onSelect={onSelect} onDelete={vi.fn()} onNew={vi.fn()} />);
    fireEvent.click(screen.getAllByText(/My Wishlist/)[0]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('shows empty state when no lists', () => {
    render(<ListSidebar lists={[]} activeListId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />);
    expect(screen.getByText('No lists yet')).toBeTruthy();
  });

  it('shows new list form when + New is clicked', () => {
    render(<ListSidebar lists={[]} activeListId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />);
    fireEvent.click(screen.getByText('+ New'));
    expect(screen.getByPlaceholderText('List name')).toBeTruthy();
  });

  it('calls onNew with name and listType on submit', () => {
    const onNew = vi.fn();
    render(<ListSidebar lists={[]} activeListId={null} onSelect={vi.fn()} onDelete={vi.fn()} onNew={onNew} />);
    fireEvent.click(screen.getByText('+ New'));
    fireEvent.change(screen.getByPlaceholderText('List name'), { target: { value: 'My List' } });
    fireEvent.click(screen.getByText('Create'));
    expect(onNew).toHaveBeenCalledWith('My List', 'wishlist');
  });
});
