import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders with children', () => {
    render(
      <Card>
        <div data-testid="card-content">Hello World</div>
      </Card>
    )

    expect(screen.getByTestId('card-content')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeVisible()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('glass', 'rounded-lg', 'p-4')
  })

  it('applies hover classes when hover prop is true', () => {
    const { container } = render(
      <Card hover>
        <div>Hoverable Content</div>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('glass-hover', 'cursor-pointer', 'transition-all', 'duration-300')
  })

  it('handles onClick events', () => {
    const handleClick = vi.fn()
    const { container } = render(
      <Card hover onClick={handleClick}>
        <div>Clickable</div>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <div>Content</div>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-class')
  })

  it('applies pokemon type glow styles', () => {
    const { container } = render(
      <Card pokemonType="fire">
        <div>Fire Pokemon</div>
      </Card>
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveStyle({ '--glow-color': 'var(--type-fire)' })
    expect(card).toHaveClass('hover:shadow-[0_0_15px_var(--glow-color)]')
  })

  it('applies different type colors', () => {
    const { container: waterContainer } = render(<Card pokemonType="water">Water</Card>)
    const waterCard = waterContainer.firstChild as HTMLElement
    expect(waterCard).toHaveStyle({ '--glow-color': 'var(--type-water)' })

    const { container: grassContainer } = render(<Card pokemonType="grass">Grass</Card>)
    const grassCard = grassContainer.firstChild as HTMLElement
    expect(grassCard).toHaveStyle({ '--glow-color': 'var(--type-grass)' })
  })
})
