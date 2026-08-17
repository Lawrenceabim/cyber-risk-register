import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders an empty risk register with an accessible overview', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /understand and prioritize cyber risk/i,
      }),
    ).toBeInTheDocument()

    const overview = screen.getByRole('region', {
      name: /risk overview/i,
    })

    expect(within(overview).getByText('Total risks')).toBeInTheDocument()
    expect(within(overview).getByText('Critical risks')).toBeInTheDocument()
    expect(within(overview).getAllByText('0')).toHaveLength(4)

    expect(
      screen.getByRole('region', {
        name: /no risks recorded yet/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /skip to main content/i }),
    ).toHaveAttribute('href', '#main-content')
  })
})