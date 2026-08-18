import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import {
  createRiskFromDraft,
  type RiskDraft,
  validateRiskDraft,
} from './riskDraft'

const validDraft: RiskDraft = {
  title: 'Cloud administrator access is over-permissioned',
  description:
    'Several cloud administrator roles include permissions that are not required.',
  category: 'Access control',
  likelihood: 3,
  impact: 4,
  owner: 'Cloud security team',
  targetDate: '2026-11-15',
}

describe('validateRiskDraft', () => {
  it('accepts a complete valid risk draft', () => {
    expect(validateRiskDraft(validDraft)).toEqual({})
  })

  it('reports invalid required values and risk levels', () => {
    expect(
      validateRiskDraft({
        ...validDraft,
        title: ' ',
        description: 'Short',
        category: 'Unknown category',
        likelihood: 0,
        impact: 6,
        owner: '',
        targetDate: '2026-02-30',
      }),
    ).toEqual({
      title: 'Enter a title between 3 and 120 characters.',
      description:
        'Enter a description between 10 and 500 characters.',
      category: 'Choose a valid category.',
      likelihood: 'Choose a likelihood from 1 to 5.',
      impact: 'Choose an impact from 1 to 5.',
      owner: 'Enter an owner between 2 and 80 characters.',
      targetDate: 'Enter a valid target date.',
    })
  })
})

describe('createRiskFromDraft', () => {
  it('creates a normalized risk without mutating existing records', () => {
    const existingRisks = seedRisks.map((risk) => ({ ...risk }))
    const originalRisks = JSON.stringify(existingRisks)

    const risk = createRiskFromDraft(
      {
        ...validDraft,
        title: `  ${validDraft.title}  `,
        owner: `  ${validDraft.owner}  `,
      },
      existingRisks,
      new Date('2026-08-18T12:00:00.000Z'),
    )

    expect(risk).toMatchObject({
      id: 'RISK-006',
      title: validDraft.title,
      owner: validDraft.owner,
      status: 'Open',
      updatedAt: '2026-08-18',
    })

    expect(JSON.stringify(existingRisks)).toBe(originalRisks)
  })

  it('continues from the highest valid risk sequence', () => {
    const risk = createRiskFromDraft(
      validDraft,
      [
        { ...seedRisks[0], id: 'legacy-risk' },
        { ...seedRisks[1], id: 'RISK-009' },
      ],
      new Date('2026-08-18T12:00:00.000Z'),
    )

    expect(risk.id).toBe('RISK-010')
  })

  it('refuses to create an invalid risk', () => {
    expect(() =>
      createRiskFromDraft(
        { ...validDraft, title: '' },
        seedRisks,
      ),
    ).toThrow('Cannot create a risk from invalid values.')
  })
})