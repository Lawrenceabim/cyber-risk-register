import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import App from './App'
import { seedRisks } from './data/seedRisks'
import { riskStorageKey } from './hooks/usePersistentRisks'
import { serializeRiskRegister } from './utils/riskExport'

const exportDate = new Date('2026-08-18T12:34:56.000Z')

function createImportFile(contents: string): File {
  const file = new File(
    [contents],
    'imported-register.json',
    {
      type: 'application/json',
    },
  )

  Object.defineProperty(file, 'text', {
    configurable: true,
    value: vi.fn().mockResolvedValue(contents),
  })

  return file
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App risk import', () => {
  it('replaces and persists the register after confirmation', async () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true)

    const importedRisks = [
      {
        ...seedRisks[0],
        id: 'RISK-900',
        title: 'Imported cloud access exposure',
        owner: 'Cloud assurance team',
        status: 'Accepted' as const,
      },
    ]

    render(<App />)

    fireEvent.change(
      screen.getByLabelText(
        /choose risk register json file/i,
      ),
      {
        target: {
          files: [
            createImportFile(
              serializeRiskRegister(
                importedRisks,
                exportDate,
              ),
            ),
          ],
        },
      },
    )

    await waitFor(() => {
      expect(screen.getByText('1 risk')).toBeInTheDocument()
    })

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    const importedRow = within(table).getByRole('row', {
      name: /risk-900/i,
    })

    expect(
      within(importedRow).getByText(
        'Imported cloud access exposure',
      ),
    ).toBeInTheDocument()

    expect(
      within(importedRow).getByText(
        'Cloud assurance team',
      ),
    ).toBeInTheDocument()

    expect(
      within(table).queryByText('RISK-001'),
    ).not.toBeInTheDocument()

    expect(confirmSpy).toHaveBeenCalledOnce()

    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(riskStorageKey) ??
            '[]',
        ),
      ).toEqual(importedRisks)
    })

    expect(seedRisks).toHaveLength(5)
    expect(seedRisks[0].id).toBe('RISK-001')
  })
})