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
})