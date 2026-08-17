import { describe, expect, it } from 'vitest'
import { calculateRiskScore, getRiskSeverity } from './risk'

describe('risk scoring', () => {
  it('multiplies likelihood by impact', () => {
    expect(calculateRiskScore({ likelihood: 4, impact: 5 })).toBe(20)
  })

  it('classifies risk scores at each severity boundary', () => {
    expect(getRiskSeverity({ likelihood: 1, impact: 4 })).toBe('Low')
    expect(getRiskSeverity({ likelihood: 2, impact: 3 })).toBe('Medium')
    expect(getRiskSeverity({ likelihood: 3, impact: 4 })).toBe('High')
    expect(getRiskSeverity({ likelihood: 4, impact: 5 })).toBe('Critical')
  })
})