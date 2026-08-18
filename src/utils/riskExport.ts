import type { Risk } from '../types/risk'

export const riskExportKind = 'cyber-risk-register' as const
export const riskExportVersion = 1 as const

export interface RiskExportDocument {
  kind: typeof riskExportKind
  version: typeof riskExportVersion
  exportedAt: string
  risks: Risk[]
}

export function createRiskExportDocument(
  risks: readonly Risk[],
  now: Date = new Date(),
): RiskExportDocument {
  return {
    kind: riskExportKind,
    version: riskExportVersion,
    exportedAt: now.toISOString(),
    risks: risks.map((risk) => ({ ...risk })),
  }
}

export function serializeRiskRegister(
  risks: readonly Risk[],
  now: Date = new Date(),
): string {
  const document = createRiskExportDocument(risks, now)

  return `${JSON.stringify(document, null, 2)}\n`
}

export function getRiskExportFilename(
  now: Date = new Date(),
): string {
  return `cyber-risk-register-${now.toISOString().slice(0, 10)}.json`
}