import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ProtectedRoute', () => {
  it('shows spinner while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    const { container } = renderWithRouter(
      <ProtectedRoute><p>Secret</p></ProtectedRoute>
    );

    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@b.com', plan: 'free', role: 'user' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute><p>Secret</p></ProtectedRoute>
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('redirects to / when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    renderWithRouter(
      <ProtectedRoute><p>Secret</p></ProtectedRoute>
    );

    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });
});
