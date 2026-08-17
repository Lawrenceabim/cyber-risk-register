import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the dashboard shell and risk overview', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /understand and prioritize cyber risk/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', { name: /risk overview/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /skip to main content/i }),
    ).toHaveAttribute('href', '#main-content')
  })
})