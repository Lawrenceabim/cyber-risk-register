import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { sortRisks } from './sortRisks'

describe('sortRisks', () => {
  it('sorts by descending score without mutating the input', () => {
    const input = [...seedRisks].reverse()
    const originalOrder = input.map((risk) => risk.id)

    const sortedRisks = sortRisks(input, 'score-desc')

    expect(sortedRisks.map((risk) => risk.id)).toEqual([
      'RISK-001',
      'RISK-002',
      'RISK-003',
      'RISK-004',
      'RISK-005',
    ])
    expect(input.map((risk) => risk.id)).toEqual(originalOrder)
    expect(sortedRisks).not.toBe(input)
  })

  it('sorts target dates from earliest to latest', () => {
    const sortedRisks = sortRisks(seedRisks, 'target-date-asc')

    expect(sortedRisks.map((risk) => risk.id)).toEqual([
      'RISK-005',
      'RISK-004',
      'RISK-001',
      'RISK-002',
      'RISK-003',
    ])
  })

  it('sorts titles alphabetically', () => {
    const sortedRisks = sortRisks(seedRisks, 'title-asc')

    expect(sortedRisks.map((risk) => risk.id)).toEqual([
      'RISK-005',
      'RISK-004',
      'RISK-003',
      'RISK-001',
      'RISK-002',
    ])
  })
})