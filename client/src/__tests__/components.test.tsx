import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardItem from '../components/CardItem';
import AddBar from '../components/AddBar';
import ProModal from '../components/ProModal';
import TabBar from '../components/TabBar';
import { LanguageProvider } from '../hooks/useLanguage';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

describe('CardItem', () => {
  it('should render card name and id', () => {
    render(
      <CardItem
        id="base4-1"
        name="Charizard"
        image="https://example.com/card.webp"
        owned={false}
        onToggle={() => {}}
        onDetails={() => {}}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Charizard')).toBeInTheDocument();
    expect(screen.getByText('base4-1')).toBeInTheDocument();
  });

  it('should show checkmark badge when owned', () => {
    const { container } = render(
      <CardItem
        id="base4-1"
        name="Charizard"
        image="https://example.com/card.webp"
        owned={true}
        onToggle={() => {}}
        onDetails={() => {}}
      />,
      { wrapper: Wrapper }
    );

    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('should apply grayscale when not owned', () => {
    render(
      <CardItem
        id="base4-1"
        name="Charizard"
        image="https://example.com/card.webp"
        owned={false}
        onToggle={() => {}}
        onDetails={() => {}}
      />,
      { wrapper: Wrapper }
    );

    const img = screen.getByAltText('Charizard');
    expect(img.className).toContain('grayscale');
  });

  it('should not apply grayscale when owned', () => {
    render(
      <CardItem
        id="base4-1"
        name="Charizard"
        image="https://example.com/card.webp"
        owned={true}
        onToggle={() => {}}
        onDetails={() => {}}
      />,
      { wrapper: Wrapper }
    );

    const img = screen.getByAltText('Charizard');
    expect(img.className).not.toContain('grayscale');
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(
      <CardItem
        id="base4-1"
        name="Charizard"
        image="https://example.com/card.webp"
        owned={false}
        onToggle={onToggle}
        onDetails={() => {}}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByAltText('Charizard'));
    expect(onToggle).toHaveBeenCalledWith('base4-1');
  });
});

describe('AddBar', () => {
  it('should render input and button', () => {
    render(<AddBar onAdd={() => {}} />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText(/search pokemon/i)).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render suggestion chips', () => {
    render(<AddBar onAdd={() => {}} />, { wrapper: Wrapper });

    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('Charizard')).toBeInTheDocument();
    expect(screen.getByText('Mewtwo')).toBeInTheDocument();
  });

  it('should call onAdd when suggestion chip is clicked', () => {
    const onAdd = vi.fn();
    render(<AddBar onAdd={onAdd} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Pikachu'));
    expect(onAdd).toHaveBeenCalledWith('Pikachu');
  });

  it('should call onAdd when form is submitted', () => {
    const onAdd = vi.fn();
    render(<AddBar onAdd={onAdd} />, { wrapper: Wrapper });

    const input = screen.getByPlaceholderText(/search pokemon/i);
    fireEvent.change(input, { target: { value: 'Ditto' } });
    fireEvent.submit(input.closest('form')!);

    expect(onAdd).toHaveBeenCalledWith('Ditto');
  });

  it('should not call onAdd for empty input', () => {
    const onAdd = vi.fn();
    render(<AddBar onAdd={onAdd} />, { wrapper: Wrapper });

    const input = screen.getByPlaceholderText(/search pokemon/i);
    fireEvent.submit(input.closest('form')!);

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should disable when disabled prop is true', () => {
    render(<AddBar onAdd={() => {}} disabled />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText(/search pokemon/i)).toBeDisabled();
    expect(screen.getByText('Add')).toBeDisabled();
  });
});

describe('AddBar - artist mode', () => {
  it('should render artist mode button', () => {
    render(<AddBar onAdd={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByText('Artist')).toBeInTheDocument();
  });

  it('should show artist placeholder when artist mode is selected', () => {
    render(<AddBar onAdd={() => {}} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Artist'));
    expect(screen.getByPlaceholderText(/illustrator/i)).toBeInTheDocument();
  });

  it('should call onAdd with artist: prefix in artist mode', () => {
    const onAdd = vi.fn();
    render(<AddBar onAdd={onAdd} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Artist'));
    const input = screen.getByPlaceholderText(/illustrator/i);
    fireEvent.change(input, { target: { value: 'Mitsuhiro Arita' } });
    fireEvent.submit(input.closest('form')!);

    expect(onAdd).toHaveBeenCalledWith('artist:Mitsuhiro Arita');
  });

  it('should hide quick suggestions chips in artist mode', () => {
    render(<AddBar onAdd={() => {}} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Artist'));
    expect(screen.queryByText('Pikachu')).not.toBeInTheDocument();
  });

  it('should not call onAdd for empty input in artist mode', () => {
    const onAdd = vi.fn();
    render(<AddBar onAdd={onAdd} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Artist'));
    const input = screen.getByPlaceholderText(/illustrator/i);
    fireEvent.submit(input.closest('form')!);

    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('TabBar', () => {
  const baseProps = {
    activeId: null,
    onSelect: () => {},
    onRemove: () => {},
    cardCounts: {},
  };

  it('should display artist name without artist: prefix', () => {
    render(
      <TabBar
        {...baseProps}
        collections={[{ id: 1, userId: 1, entryName: 'artist:Mitsuhiro Arita', createdAt: '' }]}
      />
    );
    expect(screen.getByText(/Mitsuhiro Arita/)).toBeInTheDocument();
    expect(screen.queryByText(/artist:/)).not.toBeInTheDocument();
  });

  it('should display set name without set: prefix', () => {
    render(
      <TabBar
        {...baseProps}
        collections={[{ id: 1, userId: 1, entryName: 'set:swsh1:Sword & Shield', createdAt: '' }]}
      />
    );
    expect(screen.getByText(/Sword & Shield/)).toBeInTheDocument();
    expect(screen.queryByText(/set:/)).not.toBeInTheDocument();
  });

  it('should display pokemon name as-is', () => {
    render(
      <TabBar
        {...baseProps}
        collections={[{ id: 1, userId: 1, entryName: 'Pikachu', createdAt: '' }]}
      />
    );
    expect(screen.getByText(/Pikachu/)).toBeInTheDocument();
  });

  it('should show owned/total counts in tab', () => {
    render(
      <TabBar
        {...baseProps}
        collections={[{ id: 1, userId: 1, entryName: 'artist:Mitsuhiro Arita', createdAt: '' }]}
        cardCounts={{ 'artist:Mitsuhiro Arita': { owned: 5, total: 20 } }}
      />
    );
    expect(screen.getByText('5/20')).toBeInTheDocument();
  });
});

describe('ProModal', () => {
  it('should render upgrade content', () => {
    render(<ProModal onClose={() => {}} />, { wrapper: Wrapper });

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    expect(screen.getByText(/free plan limit/i)).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('should call onClose when "Maybe later" is clicked', () => {
    const onClose = vi.fn();
    render(<ProModal onClose={onClose} />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Maybe later'));
    expect(onClose).toHaveBeenCalled();
  });
});
