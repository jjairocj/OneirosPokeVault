import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../hooks/useCardNote', () => ({
  useCardNote: () => ({
    note: null,
    loading: false,
    saving: false,
    fetchNote: vi.fn(),
    saveNote: vi.fn().mockResolvedValue(true),
    deleteNote: vi.fn(),
  }),
}));

import CardNoteEditor from '../components/pro/CardNoteEditor';

describe('CardNoteEditor', () => {
  it('shows + Add button when no note exists', () => {
    render(<CardNoteEditor cardId="swsh1-1" />);
    expect(screen.getByText('+ Add')).toBeTruthy();
  });

  it('shows textarea when editing', () => {
    render(<CardNoteEditor cardId="swsh1-1" />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByPlaceholderText(/Write a note/)).toBeTruthy();
  });

  it('shows char count when editing', () => {
    render(<CardNoteEditor cardId="swsh1-1" />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('0/1000')).toBeTruthy();
  });
});
