import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  riskCategories,
  riskStatuses,
  type Risk,
  type RiskCategory,
  type RiskLevel,
  type RiskStatus,
} from '../types/risk'

export const riskStorageKey = 'cyber-risk-register:risks:v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isRiskStatus(value: unknown): value is RiskStatus {
  return (
    typeof value === 'string' &&
    (riskStatuses as readonly string[]).includes(value)
  )
}

function isRiskCategory(value: unknown): value is RiskCategory {
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
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  )
}

function isRisk(value: unknown): value is Risk {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isRiskCategory(value.category) &&
    isRiskLevel(value.likelihood) &&
    isRiskLevel(value.impact) &&
    isRiskStatus(value.status) &&
    typeof value.owner === 'string' &&
    isIsoDate(value.targetDate) &&
    isIsoDate(value.updatedAt)
  )
}

function readStoredRisks(initialRisks: readonly Risk[]): Risk[] {
  if (typeof window === 'undefined') {
    return [...initialRisks]
  }

  try {
    const storedValue = window.localStorage.getItem(riskStorageKey)

    if (storedValue === null) {
      return [...initialRisks]
    }

    const parsedValue: unknown = JSON.parse(storedValue)

    if (
      Array.isArray(parsedValue) &&
      parsedValue.every((risk) => isRisk(risk))
    ) {
      return parsedValue
    }
  } catch {
    // Corrupted or unavailable storage falls back to seed data.
  }

  return [...initialRisks]
}

export function usePersistentRisks(
  initialRisks: readonly Risk[],
): readonly [
  Risk[],
  Dispatch<SetStateAction<Risk[]>>,
] {
  const [risks, setRisks] = useState<Risk[]>(() =>
    readStoredRisks(initialRisks),
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(
        riskStorageKey,
        JSON.stringify(risks),
      )
    } catch {
      // The in-memory register remains usable when storage is unavailable.
    }
  }, [risks])

  return [risks, setRisks] as const
}