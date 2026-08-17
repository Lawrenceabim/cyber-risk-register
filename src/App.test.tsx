import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the dashboard, overview and populated risk register', () => {
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

    const register = screen.getByRole('region', {
      name: /^risk register$/i,
    })

    expect(within(register).getByText('5 risks')).toBeInTheDocument()

    const table = within(register).getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    expect(within(table).getAllByRole('row')).toHaveLength(6)

    expect(
      screen.getByRole('link', { name: /skip to main content/i }),
    ).toHaveAttribute('href', '#main-content')
  })
})