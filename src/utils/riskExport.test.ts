import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import {
  createRiskExportDocument,
  getRiskExportFilename,
  riskExportKind,
  riskExportVersion,
  serializeRiskRegister,
} from './riskExport'

const exportDate = new Date('2026-08-18T12:34:56.000Z')

describe('createRiskExportDocument', () => {
  it('creates a versioned snapshot without sharing risk objects', () => {
    const originalRisks = JSON.stringify(seedRisks)

    const document = createRiskExportDocument(
      seedRisks,
      exportDate,
    )

    expect(document).toMatchObject({
      kind: riskExportKind,
      version: riskExportVersion,
      exportedAt: '2026-08-18T12:34:56.000Z',
    })

    expect(document.risks).toEqual(seedRisks)
    expect(document.risks).not.toBe(seedRisks)
    expect(document.risks[0]).not.toBe(seedRisks[0])
    expect(JSON.stringify(seedRisks)).toBe(originalRisks)
  })

  it('supports an empty register', () => {
    expect(
      createRiskExportDocument([], exportDate).risks,
    ).toEqual([])
  })
})

describe('serializeRiskRegister', () => {
  it('serializes a readable document that can be parsed again', () => {
    const serialized = serializeRiskRegister(
      seedRisks,
      exportDate,
    )

    expect(serialized.endsWith('\n')).toBe(true)
    expect(JSON.parse(serialized)).toEqual(
      createRiskExportDocument(seedRisks, exportDate),
    )
  })
})

describe('getRiskExportFilename', () => {
  it('uses a stable UTC calendar date', () => {
    expect(getRiskExportFilename(exportDate)).toBe(
      'cyber-risk-register-2026-08-18.json',
    )
  })
})