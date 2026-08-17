import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { RiskSummary } from './RiskSummary'

describe('RiskSummary', () => {
  it('derives overview metrics from the risk records', () => {
    render(<RiskSummary risks={seedRisks} />)

    expect(
      within(
        screen.getByRole('article', { name: /total risks/i }),
      ).getByText('5'),
    ).toBeInTheDocument()

    expect(
      within(
        screen.getByRole('article', { name: /critical risks/i }),
      ).getByText('1'),
    ).toBeInTheDocument()

    expect(
      within(
        screen.getByRole('article', { name: /active risks/i }),
      ).getByText('4'),
    ).toBeInTheDocument()

    expect(
      within(
        screen.getByRole('article', { name: /mitigated risks/i }),
      ).getByText('1'),
    ).toBeInTheDocument()
  })
})