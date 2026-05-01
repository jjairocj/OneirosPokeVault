import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { plan: 'free', role: 'user', email: 'test@test.com' }, loading: false }),
}));

vi.mock('../hooks/usePayments', () => ({
  usePayments: () => ({ loading: false, error: null, initiate: vi.fn().mockResolvedValue(null) }),
  PLAN_INFO: {
    pro_monthly_cop: { label: 'Pro Mensual', price: '$19.900', currency: 'COP', period: 'mes', provider: 'Bold PSE' },
    pro_monthly_usd: { label: 'Pro Monthly', price: '$4.99', currency: 'USD', period: 'month', provider: 'Stripe' },
    pro_yearly_cop: { label: 'Pro Anual', price: '$189.000', currency: 'COP', period: 'año', provider: 'Bold PSE', savings: 'Ahorra 2 meses' },
    pro_yearly_usd: { label: 'Pro Yearly', price: '$39.99', currency: 'USD', period: 'year', provider: 'Stripe', savings: 'Save 2 months' },
  },
}));

import Pricing from '../pages/Pricing';

describe('Pricing', () => {
  function renderPricing() {
    return render(<MemoryRouter><Pricing /></MemoryRouter>);
  }

  it('shows COP plans by default', () => {
    renderPricing();
    expect(screen.getByText('Pro Mensual')).toBeTruthy();
    expect(screen.getByText('Pro Anual')).toBeTruthy();
  });

  it('switches to USD plans when USD button clicked', () => {
    renderPricing();
    fireEvent.click(screen.getByText('USD'));
    expect(screen.getByText('Pro Monthly')).toBeTruthy();
    expect(screen.getByText('Pro Yearly')).toBeTruthy();
  });

  it('shows savings badge on yearly plan', () => {
    renderPricing();
    expect(screen.getByText('Ahorra 2 meses')).toBeTruthy();
  });

  it('shows pro features list', () => {
    renderPricing();
    expect(screen.getByText('Todo incluido en Pro')).toBeTruthy();
  });

  it('shows subscribe buttons', () => {
    renderPricing();
    const buttons = screen.getAllByText('Suscribirse');
    expect(buttons.length).toBe(2);
  });
});
