import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App risk details', () => {
  it('opens risk details and restores focus after closing', async () => {
    const user = userEvent.setup()
    render(<App />)

    const opener = screen.getByRole('button', {
      name: /view details for risk-001/i,
    })

    await user.click(opener)

    const dialog = screen.getByRole('dialog', {
      name: /privileged accounts lack phishing-resistant mfa/i,
    })

    expect(
      within(dialog).getByText(/password-only fallback/i),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/critical — score 20/i),
    ).toBeInTheDocument()

    const closeButton = within(dialog).getByRole('button', {
      name: /close/i,
    })

    expect(closeButton).toHaveFocus()

    await user.click(closeButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('updates status, metrics and filtered results immutably', async () => {
    const user = userEvent.setup()
    render(<App />)

    const register = screen.getByRole('region', {
      name: /^risk register$/i,
    })
    const overview = screen.getByRole('region', {
      name: /risk overview/i,
    })
    const statusFilter = within(register).getByRole('combobox', {
      name: /^status$/i,
    })

    await user.selectOptions(statusFilter, 'Open')

    expect(within(register).getByText('3 risks')).toBeInTheDocument()

    const opener = within(register).getByRole('button', {
      name: /view details for risk-001/i,
    })

    await user.click(opener)

    const dialog = screen.getByRole('dialog')
    const dialogStatus = within(dialog).getByRole('combobox', {
      name: /risk status/i,
    })
    const saveButton = within(dialog).getByRole('button', {
      name: /save status/i,
    })

    await user.selectOptions(dialogStatus, 'Mitigated')
    await user.click(saveButton)

    expect(dialogStatus).toHaveValue('Mitigated')
    expect(saveButton).toBeDisabled()

    const activeCard = within(overview).getByRole('article', {
      name: /active risks/i,
    })
    const mitigatedCard = within(overview).getByRole('article', {
      name: /mitigated risks/i,
    })

    expect(within(activeCard).getByText('3')).toBeInTheDocument()
    expect(within(mitigatedCard).getByText('2')).toBeInTheDocument()
    expect(within(register).getByText('2 risks')).toBeInTheDocument()
    expect(
      within(register).queryByRole('button', {
        name: /view details for risk-001/i,
      }),
    ).not.toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: /close/i }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(register).getByRole('heading', {
        level: 2,
        name: /risk register/i,
      }),
    ).toHaveFocus()
  })
})