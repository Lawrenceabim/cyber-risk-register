import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { RiskDetailsDialog } from './RiskDetailsDialog'

const risk = seedRisks[0]

function DialogHarness() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        View risk
      </button>

      {isOpen ? (
        <RiskDetailsDialog
          risk={risk}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  )
}

describe('RiskDetailsDialog', () => {
  it('renders complete risk information', () => {
    render(<RiskDetailsDialog risk={risk} onClose={() => undefined} />)

    const dialog = screen.getByRole('dialog', {
      name: /privileged accounts lack phishing-resistant mfa/i,
    })

    expect(within(dialog).getByText('RISK-001')).toBeInTheDocument()
    expect(
      within(dialog).getByText(/password-only fallback/i),
    ).toBeInTheDocument()
    expect(within(dialog).getByText(/critical — score 20/i)).toBeInTheDocument()
    expect(within(dialog).getByText('Identity and access team')).toBeInTheDocument()
    expect(within(dialog).getByText('15 Sept 2026')).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', { name: /close/i }),
    ).toHaveFocus()
  })

  it('closes with Escape and restores focus to the opener', async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    const opener = screen.getByRole('button', { name: /view risk/i })

    await user.click(opener)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /close/i }),
    ).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})