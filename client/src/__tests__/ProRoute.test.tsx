import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProRoute from '../components/ProRoute';

const mockUseAuth = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ProRoute', () => {
  it('shows spinner while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    const { container } = renderWithRouter(
      <ProRoute><p>Pro Content</p></ProRoute>
    );

    expect(screen.queryByText('Pro Content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders children for pro user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@b.com', plan: 'pro', role: 'user' },
      loading: false,
    });

    renderWithRouter(
      <ProRoute><p>Pro Content</p></ProRoute>
    );

    expect(screen.getByText('Pro Content')).toBeInTheDocument();
  });

  it('renders children for admin user regardless of plan', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@b.com', plan: 'free', role: 'admin' },
      loading: false,
    });

    renderWithRouter(
      <ProRoute><p>Pro Content</p></ProRoute>
    );

    expect(screen.getByText('Pro Content')).toBeInTheDocument();
  });

  it('redirects free user to /', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@b.com', plan: 'free', role: 'user' },
      loading: false,
    });

    renderWithRouter(
      <ProRoute><p>Pro Content</p></ProRoute>
    );

    expect(screen.queryByText('Pro Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    renderWithRouter(
      <ProRoute><p>Pro Content</p></ProRoute>
    );

    expect(screen.queryByText('Pro Content')).not.toBeInTheDocument();
  });
});
