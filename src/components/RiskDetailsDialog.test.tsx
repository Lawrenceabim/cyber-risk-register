import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import type { RiskStatus } from '../types/risk'
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
    expect(
      within(dialog).getByText(/critical — score 20/i),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Identity and access team'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('15 Sept 2026')).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', { name: /close/i }),
    ).toHaveFocus()
  })

  it('submits an explicitly selected status', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn<(status: RiskStatus) => void>()

    render(
      <RiskDetailsDialog
        risk={risk}
        onClose={() => undefined}
        onStatusChange={onStatusChange}
      />,
    )

    const statusSelect = screen.getByRole('combobox', {
      name: /risk status/i,
    })
    const saveButton = screen.getByRole('button', {
      name: /save status/i,
    })

    expect(statusSelect).toHaveValue('Open')
    expect(saveButton).toBeDisabled()

    await user.selectOptions(statusSelect, 'Mitigated')

    expect(saveButton).toBeEnabled()
    expect(
      screen.getByText(/status will change from open to mitigated/i),
    ).toBeInTheDocument()

    await user.click(saveButton)

    expect(onStatusChange).toHaveBeenCalledOnce()
    expect(onStatusChange).toHaveBeenCalledWith('Mitigated')
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