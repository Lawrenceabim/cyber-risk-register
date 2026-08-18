import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { RiskTable } from './RiskTable'

describe('RiskTable', () => {
  it('renders risks with derived severity and score', () => {
    render(<RiskTable risks={seedRisks} today="2026-08-18" />)

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    expect(within(table).getAllByRole('row')).toHaveLength(6)

    const firstRisk = within(table).getByRole('row', {
      name: /risk-001/i,
    })

    expect(within(firstRisk).getByText('Critical')).toBeInTheDocument()
    expect(within(firstRisk).getByText('Score 20')).toBeInTheDocument()
    expect(within(firstRisk).getByText('15 Sept 2026')).toBeInTheDocument()
  })

  it('renders accessible timeline cues with exact day counts', () => {
    render(<RiskTable risks={seedRisks} today="2026-08-18" />)

    const dueSoonRisk = screen.getByRole('row', {
      name: /risk-001/i,
    })
    const onTrackRisk = screen.getByRole('row', {
      name: /risk-002/i,
    })
    const completedRisk = screen.getByRole('row', {
      name: /risk-005/i,
    })

    expect(
      within(dueSoonRisk).getByText('Due soon'),
    ).toBeInTheDocument()
    expect(
      within(dueSoonRisk).getByText('Due in 28 days'),
    ).toBeInTheDocument()

    expect(
      within(onTrackRisk).getByText('On track'),
    ).toBeInTheDocument()
    expect(
      within(onTrackRisk).getByText('Due in 43 days'),
    ).toBeInTheDocument()

    expect(
      within(completedRisk).getByText('Completed'),
    ).toBeInTheDocument()
    expect(
      within(completedRisk).getByText('Treatment completed'),
    ).toBeInTheDocument()
  })

  it('renders a status message instead of an empty table', () => {
    render(<RiskTable risks={[]} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /start with your highest-priority risk/i,
      }),
    ).toBeInTheDocument()
  })
})