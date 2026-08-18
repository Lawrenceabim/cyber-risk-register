import type { Risk } from '../types/risk'
import {
  riskExportKind,
  riskExportVersion,
} from './riskExport'
import { parseRiskCollection } from './riskValidation'

export interface ImportedRiskRegister {
  exportedAt: string
  risks: Risk[]
}

export type RiskImportResult =
  | {
      ok: true
      data: ImportedRiskRegister
    }
  | {
      ok: false
      error: string
    }

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCanonicalIsoTimestamp(
  value: unknown,
): value is string {
  if (typeof value !== 'string') return false

  const parsedDate = new Date(value)

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString() === value
  )
}

export function parseRiskImport(
  fileContents: string,
): RiskImportResult {
  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(fileContents) as unknown
  } catch {
    return {
      ok: false,
      error: 'The selected file is not valid JSON.',
    }
  }

  if (
    !isRecord(parsedValue) ||
    parsedValue.kind !== riskExportKind
  ) {
    return {
      ok: false,
      error:
        'This file is not a Cyber Risk Register export.',
    }
  }

  if (parsedValue.version !== riskExportVersion) {
    return {
      ok: false,
      error: 'This export uses an unsupported version.',
    }
  }

  if (!isCanonicalIsoTimestamp(parsedValue.exportedAt)) {
    return {
      ok: false,
      error: 'The export timestamp is invalid.',
    }
  }

  const risks = parseRiskCollection(parsedValue.risks)

  if (risks === null) {
    return {
      ok: false,
      error:
        'The export contains invalid or duplicate risk records.',
    }
  }

  return {
    ok: true,
    data: {
      exportedAt: parsedValue.exportedAt,
      risks,
    },
  }
}