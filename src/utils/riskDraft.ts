import {
  riskCategories,
  type Risk,
  type RiskCategory,
  type RiskLevel,
} from '../types/risk'

export interface RiskDraft {
  title: string
  description: string
  category: string
  likelihood: number
  impact: number
  owner: string
  targetDate: string
}

export type RiskDraftErrors = Partial<
  Record<keyof RiskDraft, string>
>

function isRiskLevel(value: number): value is RiskLevel {
  return Number.isInteger(value) && value >= 1 && value <= 5
}

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsedDate = new Date(`${value}T00:00:00.000Z`)

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  )
}

export function validateRiskDraft(
  draft: RiskDraft,
): RiskDraftErrors {
  const errors: RiskDraftErrors = {}
  const title = draft.title.trim()
  const description = draft.description.trim()
  const owner = draft.owner.trim()

  if (title.length < 3 || title.length > 120) {
    errors.title = 'Enter a title between 3 and 120 characters.'
  }

  if (description.length < 10 || description.length > 500) {
    errors.description =
      'Enter a description between 10 and 500 characters.'
  }

  if (
    !riskCategories.includes(draft.category as RiskCategory)
  ) {
    errors.category = 'Choose a valid category.'
  }

  if (!isRiskLevel(draft.likelihood)) {
    errors.likelihood = 'Choose a likelihood from 1 to 5.'
  }

  if (!isRiskLevel(draft.impact)) {
    errors.impact = 'Choose an impact from 1 to 5.'
  }

  if (owner.length < 2 || owner.length > 80) {
    errors.owner = 'Enter an owner between 2 and 80 characters.'
  }

  if (!isValidCalendarDate(draft.targetDate)) {
    errors.targetDate = 'Enter a valid target date.'
  }

  return errors
}

function getNextRiskId(risks: readonly Risk[]): string {
  const highestSequence = risks.reduce((highest, risk) => {
    const match = /^RISK-(\d+)$/.exec(risk.id)
    const sequence = match?.[1] ? Number(match[1]) : 0

    return Math.max(highest, sequence)
  }, 0)

  return `RISK-${String(highestSequence + 1).padStart(3, '0')}`
}

export function createRiskFromDraft(
  draft: RiskDraft,
  existingRisks: readonly Risk[],
  now: Date = new Date(),
): Risk {
  const errors = validateRiskDraft(draft)

  if (Object.keys(errors).length > 0) {
    throw new Error('Cannot create a risk from invalid values.')
  }

  return {
    id: getNextRiskId(existingRisks),
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category as RiskCategory,
    likelihood: draft.likelihood as RiskLevel,
    impact: draft.impact as RiskLevel,
    status: 'Open',
    owner: draft.owner.trim(),
    targetDate: draft.targetDate,
    updatedAt: now.toISOString().slice(0, 10),
  }
}