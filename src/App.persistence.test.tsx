import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { seedRisks } from './data/seedRisks'
import { riskStorageKey } from './hooks/usePersistentRisks'

describe('App persistence', () => {
  it('restores saved risk changes from local storage', () => {
    const savedRisks = seedRisks.map((risk) =>
      risk.id === 'RISK-001'
        ? {
            ...risk,
            status: 'Mitigated' as const,
            updatedAt: '2026-08-18',
          }
        : risk,
    )

    window.localStorage.setItem(
      riskStorageKey,
      JSON.stringify(savedRisks),
    )

    render(<App />)

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    const riskRow = within(table).getByRole('row', {
      name: /risk-001/i,
    })

    expect(within(riskRow).getByText('Mitigated')).toBeInTheDocument()
    expect(within(riskRow).getByText('Completed')).toBeInTheDocument()
  })
})