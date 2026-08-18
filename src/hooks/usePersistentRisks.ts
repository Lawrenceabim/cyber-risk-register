import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { Risk } from '../types/risk'
import { parseRiskCollection } from '../utils/riskValidation'

export const riskStorageKey = 'cyber-risk-register:risks:v1'

function cloneRisks(risks: readonly Risk[]): Risk[] {
  return risks.map((risk) => ({ ...risk }))
}

function readStoredRisks(
  initialRisks: readonly Risk[],
): Risk[] {
  if (typeof window === 'undefined') {
    return cloneRisks(initialRisks)
  }

  try {
    const storedValue = window.localStorage.getItem(
      riskStorageKey,
    )

    if (storedValue === null) {
      return cloneRisks(initialRisks)
    }

    const parsedRisks = parseRiskCollection(
      JSON.parse(storedValue) as unknown,
    )

    if (parsedRisks !== null) {
      return parsedRisks
    }
  } catch {
    // Corrupted or unavailable storage falls back to seed data.
  }

  return cloneRisks(initialRisks)
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