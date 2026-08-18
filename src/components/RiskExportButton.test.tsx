import {
  render,
  screen,
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
import { downloadRiskRegister } from '../utils/downloadRiskExport'
import { RiskExportButton } from './RiskExportButton'

vi.mock('../utils/downloadRiskExport', () => ({
  downloadRiskRegister: vi.fn(),
}))

const mockedDownloadRiskRegister = vi.mocked(
  downloadRiskRegister,
)

afterEach(() => {
  vi.clearAllMocks()
})

describe('RiskExportButton', () => {
  it('downloads the current risks and reports success', async () => {
    const user = userEvent.setup()

    mockedDownloadRiskRegister.mockReturnValue(
      'cyber-risk-register-2026-08-18.json',
    )

    render(<RiskExportButton risks={seedRisks} />)

    await user.click(
      screen.getByRole('button', {
        name: /export json/i,
      }),
    )

    expect(mockedDownloadRiskRegister).toHaveBeenCalledOnce()
    expect(mockedDownloadRiskRegister).toHaveBeenCalledWith(
      seedRisks,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Exported 5 risks to cyber-risk-register-2026-08-18.json.',
    )
  })

  it('reports a download failure without crashing', async () => {
    const user = userEvent.setup()

    mockedDownloadRiskRegister.mockImplementation(() => {
      throw new Error('Download blocked')
    })

    render(<RiskExportButton risks={seedRisks} />)

    await user.click(
      screen.getByRole('button', {
        name: /export json/i,
      }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'The risk register could not be exported. Please try again.',
    )
  })

  it('uses the singular risk label', async () => {
    const user = userEvent.setup()

    mockedDownloadRiskRegister.mockReturnValue(
      'cyber-risk-register-2026-08-18.json',
    )

    render(
      <RiskExportButton risks={seedRisks.slice(0, 1)} />,
    )

    await user.click(
      screen.getByRole('button', {
        name: /export json/i,
      }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Exported 1 risk to cyber-risk-register-2026-08-18.json.',
    )
  })
})