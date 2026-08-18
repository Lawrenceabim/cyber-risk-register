import { describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import {
  createRiskExportDocument,
  serializeRiskRegister,
} from './riskExport'
import { parseRiskImport } from './riskImport'

const exportDate = new Date('2026-08-18T12:34:56.000Z')

describe('parseRiskImport', () => {
  it('parses a valid versioned risk export', () => {
    const result = parseRiskImport(
      serializeRiskRegister(seedRisks, exportDate),
    )

    expect(result).toEqual({
      ok: true,
      data: {
        exportedAt: '2026-08-18T12:34:56.000Z',
        risks: seedRisks,
      },
    })

    if (!result.ok) {
      throw new Error('Expected a valid import result')
    }

    expect(result.data.risks).not.toBe(seedRisks)
    expect(result.data.risks[0]).not.toBe(seedRisks[0])
  })

  it('supports an empty exported register', () => {
    const result = parseRiskImport(
      serializeRiskRegister([], exportDate),
    )

    expect(result).toEqual({
      ok: true,
      data: {
        exportedAt: '2026-08-18T12:34:56.000Z',
        risks: [],
      },
    })
  })

  it('rejects malformed JSON and unrelated files', () => {
    expect(parseRiskImport('{not-json')).toEqual({
      ok: false,
      error: 'The selected file is not valid JSON.',
    })

    expect(
      parseRiskImport(
        JSON.stringify({
          kind: 'unrelated-file',
          version: 1,
          risks: [],
        }),
      ),
    ).toEqual({
      ok: false,
      error:
        'This file is not a Cyber Risk Register export.',
    })
  })

  it('rejects unsupported versions and invalid timestamps', () => {
    const validDocument = createRiskExportDocument(
      seedRisks,
      exportDate,
    )

    expect(
      parseRiskImport(
        JSON.stringify({
          ...validDocument,
          version: 2,
        }),
      ),
    ).toEqual({
      ok: false,
      error: 'This export uses an unsupported version.',
    })

    expect(
      parseRiskImport(
        JSON.stringify({
          ...validDocument,
          exportedAt: 'yesterday',
        }),
      ),
    ).toEqual({
      ok: false,
      error: 'The export timestamp is invalid.',
    })
  })

  it('rejects invalid and duplicate risk records', () => {
    const validDocument = createRiskExportDocument(
      seedRisks,
      exportDate,
    )

    expect(
      parseRiskImport(
        JSON.stringify({
          ...validDocument,
          risks: [{ id: 'INCOMPLETE' }],
        }),
      ),
    ).toEqual({
      ok: false,
      error:
        'The export contains invalid or duplicate risk records.',
    })

    expect(
      parseRiskImport(
        JSON.stringify({
          ...validDocument,
          risks: [
            seedRisks[0],
            {
              ...seedRisks[1],
              id: seedRisks[0].id,
            },
          ],
        }),
      ),
    ).toEqual({
      ok: false,
      error:
        'The export contains invalid or duplicate risk records.',
    })
  })
})