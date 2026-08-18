import { describe, expect, it } from 'vitest'
import type { Risk } from '../types/risk'
import { getRiskTimeline } from './riskTimeline'

const today = '2026-08-18'

function createTimelineInput(
  status: Risk['status'],
  targetDate: string,
): Pick<Risk, 'status' | 'targetDate'> {
  return { status, targetDate }
}

describe('getRiskTimeline', () => {
  it('marks mitigated risks as completed regardless of date', () => {
    expect(
      getRiskTimeline(
        createTimelineInput('Mitigated', '2026-08-01'),
        today,
      ),
    ).toEqual({
      state: 'Completed',
      detail: 'Treatment completed',
      daysUntilDue: null,
    })
  })

  it('identifies accepted risks separately', () => {
    expect(
      getRiskTimeline(
        createTimelineInput('Accepted', '2026-08-01'),
        today,
      ),
    ).toEqual({
      state: 'Accepted',
      detail: 'Risk accepted',
      daysUntilDue: null,
    })
  })

  it('reports overdue risks with an exact day count', () => {
    expect(
      getRiskTimeline(
        createTimelineInput('Open', '2026-08-17'),
        today,
      ),
    ).toEqual({
      state: 'Overdue',
      detail: '1 day overdue',
      daysUntilDue: -1,
    })
  })

  it('reports a target date that is due today', () => {
    expect(
      getRiskTimeline(
        createTimelineInput('Open', '2026-08-18'),
        today,
      ),
    ).toEqual({
      state: 'Due soon',
      detail: 'Due today',
      daysUntilDue: 0,
    })
  })

  it('marks targets within 30 days as due soon', () => {
    expect(
      getRiskTimeline(
        createTimelineInput('In treatment', '2026-09-01'),
        today,
      ),
    ).toEqual({
      state: 'Due soon',
      detail: 'Due in 14 days',
      daysUntilDue: 14,
    })
  })

  it('marks later targets as on track', () => {
    expect(
      getRiskTimeline(
        createTimelineInput('Open', '2026-09-30'),
        today,
      ),
    ).toEqual({
      state: 'On track',
      detail: 'Due in 43 days',
      daysUntilDue: 43,
    })
  })
})