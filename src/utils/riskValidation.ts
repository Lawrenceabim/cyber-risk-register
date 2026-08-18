import {
  riskCategories,
  riskStatuses,
  type Risk,
  type RiskCategory,
  type RiskLevel,
  type RiskStatus,
} from '../types/risk'

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  )
}

function isRiskStatus(value: unknown): value is RiskStatus {
  return (
    typeof value === 'string' &&
    (riskStatuses as readonly string[]).includes(value)
  )
}

function isRiskCategory(
  value: unknown,
): value is RiskCategory {
  return (
    typeof value === 'string' &&
    (riskCategories as readonly string[]).includes(value)
  )
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  )
}

function isIsoDate(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`)

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  )
}

export function isRisk(value: unknown): value is Risk {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isRiskCategory(value.category) &&
    isRiskLevel(value.likelihood) &&
    isRiskLevel(value.impact) &&
    isRiskStatus(value.status) &&
    isNonEmptyString(value.owner) &&
    isIsoDate(value.targetDate) &&
    isIsoDate(value.updatedAt)
  )
}

export function parseRiskCollection(
  value: unknown,
): Risk[] | null {
  if (!Array.isArray(value)) return null

  const parsedRisks: Risk[] = []
  const seenIds = new Set<string>()

  for (const candidate of value) {
    if (!isRisk(candidate) || seenIds.has(candidate.id)) {
      return null
    }

    seenIds.add(candidate.id)
    parsedRisks.push({ ...candidate })
  }

  return parsedRisks
}