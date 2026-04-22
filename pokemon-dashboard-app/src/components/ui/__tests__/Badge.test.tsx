import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';
import { typeColorMap } from '@/lib/design-tokens';

describe('Badge', () => {
  it('renders with type text', () => {
    render(<Badge type="fire" />);

    expect(screen.getByText('Fire')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<Badge type="water" label="H₂O" />);

    expect(screen.getByText('H₂O')).toBeInTheDocument();
  });

  it('applies type colors correctly for fire', () => {
    const { container } = render(<Badge type="fire" />);

    const badge = container.firstChild as HTMLElement;
    const expectedColor = typeColorMap.fire;

    expect(badge).toHaveStyle({
      backgroundColor: `${expectedColor}26`,
      color: expectedColor,
      boxShadow: `0 0 6px ${expectedColor}40`,
      border: `1px solid ${expectedColor}50`,
    });
  });

  it('applies type colors correctly for water', () => {
    const { container } = render(<Badge type="water" />);

    const badge = container.firstChild as HTMLElement;
    const expectedColor = typeColorMap.water;

    expect(badge).toHaveStyle({
      backgroundColor: `${expectedColor}26`,
      color: expectedColor,
    });
  });

  it('applies type colors correctly for all pokemon types', () => {
    const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'fighting', 'ghost', 'steel', 'flying', 'poison', 'ground', 'rock', 'bug', 'normal'] as const;

    types.forEach((type) => {
      const { container, unmount } = render(<Badge type={type} />);
      const badge = container.firstChild as HTMLElement;
      const expectedColor = typeColorMap[type];

      expect(badge).toHaveStyle({ color: expectedColor });
      unmount();
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Badge type="fire" />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-1',
      'rounded-full',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'uppercase',
      'tracking-wider',
      'transition-shadow',
      'duration-300'
    );
  });

  it('applies custom className', () => {
    const { container } = render(<Badge type="electric" className="custom-badge" />);

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-badge');
  });

  it('capitalizes type name when no label provided', () => {
    const { container: fireContainer } = render(<Badge type="fire" />);
    expect(fireContainer.textContent).toBe('Fire');

    const { container: waterContainer } = render(<Badge type="water" />);
    expect(waterContainer.textContent).toBe('Water');

    const { container: electricContainer } = render(<Badge type="electric" />);
    expect(electricContainer.textContent).toBe('Electric');
  });
});
