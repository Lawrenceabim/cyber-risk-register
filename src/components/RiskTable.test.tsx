import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { RiskTable } from './RiskTable'

describe('RiskTable', () => {
  it('renders the risks with derived severity and score', () => {
    render(<RiskTable risks={seedRisks} />)

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    expect(within(table).getAllByRole('row')).toHaveLength(
      seedRisks.length + 1,
    )

    const riskTitle = within(table).getByText(
      'Privileged accounts lack phishing-resistant MFA',
    )
    const riskRow = riskTitle.closest('tr')

    if (!riskRow) {
      throw new Error('Expected the risk title to be rendered inside a row')
    }

    expect(within(riskRow).getByText('Critical')).toBeInTheDocument()
    expect(within(riskRow).getByText('Score 20')).toBeInTheDocument()
    expect(within(riskRow).getByText(/15 Sep/)).toBeInTheDocument()
  })

  it('renders a status message when there are no risks', () => {
    render(<RiskTable risks={[]} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      /start with your highest-priority risk/i,
    )
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})