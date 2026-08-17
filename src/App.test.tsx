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
    await user.type(searchInput, 'unrecorded risk')

    expect(within(register).getByText('0 risks')).toBeInTheDocument()
    expect(within(register).queryByRole('table')).not.toBeInTheDocument()

    expect(
      within(register).getByRole('heading', {
        level: 3,
        name: /no risks match your filters/i,
      }),
    ).toBeInTheDocument()
  })

  it('combines filters and clears them while restoring search focus', async () => {
    const user = userEvent.setup()
    render(<App />)

    const register = screen.getByRole('region', {
      name: /^risk register$/i,
    })

    const searchInput = within(register).getByRole('searchbox', {
      name: /search risks/i,
    })
    const statusFilter = within(register).getByRole('combobox', {
      name: /status/i,
    })
    const categoryFilter = within(register).getByRole('combobox', {
      name: /category/i,
    })
    const clearButton = within(register).getByRole('button', {
      name: /clear filters/i,
    })

    expect(clearButton).toBeDisabled()

    await user.selectOptions(statusFilter, 'Open')

    expect(within(register).getByText('3 risks')).toBeInTheDocument()

    await user.selectOptions(categoryFilter, 'Access control')
    await user.type(searchInput, 'MFA')

    expect(within(register).getByText('1 risk')).toBeInTheDocument()
    expect(clearButton).toBeEnabled()

    await user.click(clearButton)

    expect(searchInput).toHaveValue('')
    expect(statusFilter).toHaveValue('all')
    expect(categoryFilter).toHaveValue('all')
    expect(within(register).getByText('5 risks')).toBeInTheDocument()
    expect(searchInput).toHaveFocus()
    expect(clearButton).toBeDisabled()
  })

  it('sorts the complete and filtered register deterministically', async () => {
    const user = userEvent.setup()
    render(<App />)

    const register = screen.getByRole('region', {
      name: /^risk register$/i,
    })

    const sortControl = within(register).getByRole('combobox', {
      name: /sort by/i,
    })
    const statusFilter = within(register).getByRole('combobox', {
      name: /status/i,
    })

    const getOrderedRiskIds = () =>
      within(register)
        .getAllByRole('rowheader')
        .map(
          (rowHeader) =>
            within(rowHeader).getByText(/^RISK-\d{3}$/).textContent ?? '',
        )

    await user.selectOptions(sortControl, 'target-date-asc')

    expect(getOrderedRiskIds()).toEqual([
      'RISK-005',
      'RISK-004',
      'RISK-001',
      'RISK-002',
      'RISK-003',
    ])
    expect(within(register).getByText('5 risks')).toBeInTheDocument()

    await user.selectOptions(statusFilter, 'Open')

    expect(getOrderedRiskIds()).toEqual([
      'RISK-004',
      'RISK-001',
      'RISK-003',
    ])
    expect(within(register).getByText('3 risks')).toBeInTheDocument()

    await user.selectOptions(statusFilter, 'all')
    await user.selectOptions(sortControl, 'title-asc')

    expect(getOrderedRiskIds()).toEqual([
      'RISK-005',
      'RISK-004',
      'RISK-003',
      'RISK-001',
      'RISK-002',
    ])
  })
})