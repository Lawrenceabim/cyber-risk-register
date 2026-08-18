import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { serializeRiskRegister } from '../utils/riskExport'
import {
  maxRiskImportBytes,
  RiskImportButton,
} from './RiskImportButton'

const exportDate = new Date('2026-08-18T12:34:56.000Z')

function createJsonFile(
  contents: string,
  name = 'risk-backup.json',
): File {
  const file = new File([contents], name, {
    type: 'application/json',
  })

  Object.defineProperty(file, 'text', {
    configurable: true,
    value: vi.fn().mockResolvedValue(contents),
  })

  return file
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RiskImportButton', () => {
  it('opens the file picker from a semantic button', async () => {
    const user = userEvent.setup()
    const inputClickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined)

    render(<RiskImportButton onImport={vi.fn()} />)

    await user.click(
      screen.getByRole('button', {
        name: /import json/i,
      }),
    )

    expect(inputClickSpy).toHaveBeenCalledOnce()
  })

  it('confirms and imports a valid risk export', async () => {
    const onImport = vi.fn()
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true)

    render(<RiskImportButton onImport={onImport} />)

    const file = createJsonFile(
      serializeRiskRegister(seedRisks, exportDate),
    )

    fireEvent.change(
      screen.getByLabelText(
        /choose risk register json file/i,
      ),
      {
        target: {
          files: [file],
        },
      },
    )

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledOnce()
    })

    expect(onImport).toHaveBeenCalledWith(seedRisks)
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'This will replace all risks currently in the register.',
      ),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Imported 5 risks from risk-backup.json.',
    )
  })

  it('reports invalid JSON without requesting confirmation', async () => {
    const onImport = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm')

    render(<RiskImportButton onImport={onImport} />)

    fireEvent.change(
      screen.getByLabelText(
        /choose risk register json file/i,
      ),
      {
        target: {
          files: [
            createJsonFile(
              '{not-json',
              'invalid-backup.json',
            ),
          ],
        },
      },
    )

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'The selected file is not valid JSON.',
      )
    })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(onImport).not.toHaveBeenCalled()
  })

  it('preserves existing data when replacement is cancelled', async () => {
    const onImport = vi.fn()

    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<RiskImportButton onImport={onImport} />)

    fireEvent.change(
      screen.getByLabelText(
        /choose risk register json file/i,
      ),
      {
        target: {
          files: [
            createJsonFile(
              serializeRiskRegister(
                seedRisks.slice(0, 1),
                exportDate,
              ),
            ),
          ],
        },
      },
    )

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Import cancelled. Your existing risks were not changed.',
      )
    })

    expect(onImport).not.toHaveBeenCalled()
  })

  it('rejects files larger than the supported limit', async () => {
    const onImport = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm')
    const oversizedFile = createJsonFile('{}')

    Object.defineProperty(oversizedFile, 'size', {
      configurable: true,
      value: maxRiskImportBytes + 1,
    })

    render(<RiskImportButton onImport={onImport} />)

    fireEvent.change(
      screen.getByLabelText(
        /choose risk register json file/i,
      ),
      {
        target: {
          files: [oversizedFile],
        },
      },
    )

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'The selected file is too large.',
      )
    })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(onImport).not.toHaveBeenCalled()
  })
})