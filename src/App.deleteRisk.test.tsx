import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { seedRisks } from './data/seedRisks'
import { riskStorageKey } from './hooks/usePersistentRisks'

describe('App risk deletion', () => {
  it('deletes and persists a risk after explicit confirmation', async () => {
    const user = userEvent.setup()

    render(<App />)

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    const riskRow = within(table).getByRole('row', {
      name: /risk-001/i,
    })

    await user.click(
      within(riskRow).getByRole('button', {
        name: /view details/i,
      }),
    )

    const dialog = screen.getByRole('dialog', {
      name: /privileged accounts lack phishing-resistant mfa/i,
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: /^delete risk$/i,
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: /confirm delete risk-001/i,
      }),
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog'),
      ).not.toBeInTheDocument()
    })

    expect(
      within(table).queryByRole('row', {
        name: /risk-001/i,
      }),
    ).not.toBeInTheDocument()

    expect(screen.getByText('4 risks')).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /risk register/i,
        }),
      ).toHaveFocus()
    })

    await waitFor(() => {
      const savedRisks = JSON.parse(
        window.localStorage.getItem(riskStorageKey) ?? '[]',
      ) as Array<{ id: string }>

      expect(
        savedRisks.some((risk) => risk.id === 'RISK-001'),
      ).toBe(false)
    })

    expect(seedRisks).toHaveLength(5)
    expect(
      seedRisks.some((risk) => risk.id === 'RISK-001'),
    ).toBe(true)
  })
})