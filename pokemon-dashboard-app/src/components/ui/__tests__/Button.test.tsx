import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click Me</Button>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)

    fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('applies primary variant styles by default', () => {
    const { container } = render(<Button>Primary</Button>)

    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-surface-light', 'text-white', 'border-surface-light')
  })

  it('applies secondary variant styles', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)

    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-transparent', 'border-white/20')
  })

  it('applies ghost variant styles', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)

    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-transparent', 'text-white/70', 'border-transparent')
  })

  it('applies pokemon type glow effect', () => {
    render(<Button pokemonType="fire">Fire Type</Button>)

    const button = screen.getByRole('button', { name: /fire type/i })
    expect(button).toHaveStyle({
      '--btn-glow': '#ff6b35',
      borderColor: '#ff6b35',
    })
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-btn">Custom</Button>)

    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-btn')
  })

  it('renders children content correctly', () => {
    render(
      <Button>
        <span data-testid="icon">🔥</span>
        <span>Fire Button</span>
      </Button>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Fire Button')).toBeInTheDocument()
  })

  it('is focusable via keyboard', () => {
    render(<Button>Focusable</Button>)

    const button = screen.getByRole('button', { name: /focusable/i })
    button.focus()
    expect(button).toHaveFocus()
  })

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole('button', { name: /disabled/i })
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
