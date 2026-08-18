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
import App from './App'
import { seedRisks } from './data/seedRisks'
import { downloadRiskRegister } from './utils/downloadRiskExport'

vi.mock('./utils/downloadRiskExport', () => ({
  downloadRiskRegister: vi.fn(),
}))

const mockedDownloadRiskRegister = vi.mocked(
  downloadRiskRegister,
)

afterEach(() => {
  vi.clearAllMocks()
})

describe('App risk export', () => {
  it('exports the complete current register as JSON', async () => {
    const user = userEvent.setup()

    mockedDownloadRiskRegister.mockReturnValue(
      'cyber-risk-register-2026-08-18.json',
    )

    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: /export json/i,
      }),
    )

    expect(mockedDownloadRiskRegister).toHaveBeenCalledOnce()

    const [exportedRisks] =
      mockedDownloadRiskRegister.mock.calls[0]

    expect(exportedRisks).toEqual(seedRisks)

    expect(
      screen.getByText(
        'Exported 5 risks to cyber-risk-register-2026-08-18.json.',
      ),
    ).toBeInTheDocument()
  })
})