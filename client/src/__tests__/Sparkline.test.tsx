import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sparkline from '../components/prices/Sparkline';

describe('Sparkline', () => {
  it('renders svg with polyline for valid data', () => {
    const data = [
      { value: 5.0, date: '2024-01-01' },
      { value: 6.5, date: '2024-01-08' },
      { value: 4.0, date: '2024-01-15' },
    ];
    const { container } = render(<Sparkline data={data} />);
    const svg = container.querySelector('svg');
    const polyline = container.querySelector('polyline');
    expect(svg).toBeTruthy();
    expect(polyline).toBeTruthy();
  });

  it('shows not enough data message for single point', () => {
    render(<Sparkline data={[{ value: 5, date: '2024-01-01' }]} />);
    expect(screen.getByText('Not enough data')).toBeTruthy();
  });

  it('uses green color when trend is up', () => {
    const data = [
      { value: 4.0, date: '2024-01-01' },
      { value: 6.0, date: '2024-01-08' },
    ];
    const { container } = render(<Sparkline data={data} />);
    const polyline = container.querySelector('polyline');
    expect(polyline?.getAttribute('stroke')).toBe('#34d399');
  });

  it('uses red color when trend is down', () => {
    const data = [
      { value: 6.0, date: '2024-01-01' },
      { value: 4.0, date: '2024-01-08' },
    ];
    const { container } = render(<Sparkline data={data} />);
    const polyline = container.querySelector('polyline');
    expect(polyline?.getAttribute('stroke')).toBe('#f87171');
  });
});
