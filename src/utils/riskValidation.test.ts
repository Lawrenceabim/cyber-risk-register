import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import {
  isRisk,
  parseRiskCollection,
} from './riskValidation'

describe('isRisk', () => {
  it('accepts a complete risk record', () => {
    expect(isRisk(seedRisks[0])).toBe(true)
  })

  it('rejects invalid levels, statuses and calendar dates', () => {
    expect(
      isRisk({
        ...seedRisks[0],
        likelihood: 6,
      }),
    ).toBe(false)

    expect(
      isRisk({
        ...seedRisks[0],
        status: 'Archived',
      }),
    ).toBe(false)

    expect(
      isRisk({
        ...seedRisks[0],
        targetDate: '2026-02-30',
      }),
    ).toBe(false)
  })

  it('rejects required text containing only whitespace', () => {
    expect(
      isRisk({
        ...seedRisks[0],
        owner: '   ',
      }),
    ).toBe(false)
  })
})

describe('parseRiskCollection', () => {
  it('returns an independent copy of valid risks', () => {
    const parsedRisks = parseRiskCollection(seedRisks)

    expect(parsedRisks).toEqual(seedRisks)
    expect(parsedRisks).not.toBe(seedRisks)
    expect(parsedRisks?.[0]).not.toBe(seedRisks[0])
  })

  it('supports an empty register', () => {
    expect(parseRiskCollection([])).toEqual([])
  })

  it('rejects non-array and malformed values', () => {
    expect(parseRiskCollection(null)).toBeNull()
    expect(parseRiskCollection({ risks: seedRisks })).toBeNull()
    expect(
      parseRiskCollection([{ id: 'INCOMPLETE' }]),
    ).toBeNull()
  })

  it('rejects duplicate risk identifiers', () => {
    expect(
      parseRiskCollection([
        seedRisks[0],
        {
          ...seedRisks[1],
          id: seedRisks[0].id,
        },
      ]),
    ).toBeNull()
  })
})