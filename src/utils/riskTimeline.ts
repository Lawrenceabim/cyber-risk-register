import type { Risk } from '../types/risk'

export type RiskTimelineState =
  | 'Completed'
  | 'Accepted'
  | 'Overdue'
  | 'Due soon'
  | 'On track'

export interface RiskTimeline {
  state: RiskTimelineState
  detail: string
  daysUntilDue: number | null
}

type RiskTimelineInput = Pick<Risk, 'status' | 'targetDate'>

const millisecondsPerDay = 24 * 60 * 60 * 1000

function parseIsoDate(date: string): number {
  const [year, month, day] = date.split('-').map(Number)

  return Date.UTC(year, month - 1, day)
}

function formatDayCount(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

export function getRiskTimeline(
  risk: RiskTimelineInput,
  today: string,
): RiskTimeline {
  if (risk.status === 'Mitigated') {
    return {
      state: 'Completed',
      detail: 'Treatment completed',
      daysUntilDue: null,
    }
  }

  if (risk.status === 'Accepted') {
    return {
      state: 'Accepted',
      detail: 'Risk accepted',
      daysUntilDue: null,
    }
  }

  const daysUntilDue = Math.round(
    (parseIsoDate(risk.targetDate) - parseIsoDate(today)) /
      millisecondsPerDay,
  )

  if (daysUntilDue < 0) {
    return {
      state: 'Overdue',
      detail: `${formatDayCount(Math.abs(daysUntilDue))} overdue`,
      daysUntilDue,
    }
  }

  if (daysUntilDue <= 30) {
    return {
      state: 'Due soon',
      detail:
        daysUntilDue === 0
          ? 'Due today'
          : `Due in ${formatDayCount(daysUntilDue)}`,
      daysUntilDue,
    }
  }

  return {
    state: 'On track',
    detail: `Due in ${formatDayCount(daysUntilDue)}`,
    daysUntilDue,
  }
}