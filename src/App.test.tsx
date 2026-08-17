import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('filters the register and reports when no risks match', async () => {
    const user = userEvent.setup()
    render(<App />)

    const register = screen.getByRole('region', {
      name: /^risk register$/i,
    })

    const searchInput = within(register).getByRole('searchbox', {
      name: /search risks/i,
    })

    await user.type(searchInput, 'VENDOR')

    expect(within(register).getByText('1 risk')).toBeInTheDocument()

    const filteredTable = within(register).getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    expect(within(filteredTable).getAllByRole('row')).toHaveLength(2)
    expect(
      within(filteredTable).getByText(
        /third-party processor retains sensitive exports/i,
      ),
    ).toBeInTheDocument()
    expect(
      within(filteredTable).queryByText(
        /privileged accounts lack phishing-resistant mfa/i,
      ),
    ).not.toBeInTheDocument()

    await user.clear(searchInput)

    expect(within(register).getByText('5 risks')).toBeInTheDocument()

    await user.type(searchInput, 'unrecorded risk')

    expect(within(register).getByText('0 risks')).toBeInTheDocument()
    expect(within(register).queryByRole('table')).not.toBeInTheDocument()

    const emptyState = within(register).getByRole('status')

    expect(
      within(emptyState).getByRole('heading', {
        level: 3,
        name: /no risks match your search/i,
      }),
    ).toBeInTheDocument()
  })
})