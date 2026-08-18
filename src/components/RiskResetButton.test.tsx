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
import { RiskResetButton } from './RiskResetButton'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RiskResetButton', () => {
  it('restores the demo register after confirmation', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true)

    render(
      <RiskResetButton
        defaultRiskCount={5}
        onReset={onReset}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: /reset register/i,
      }),
    )

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'This will replace all current risks with the original demo data.',
      ),
    )
    expect(onReset).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Restored 5 risks from the original demo data.',
    )
  })

  it('preserves current risks when reset is cancelled', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(
      <RiskResetButton
        defaultRiskCount={5}
        onReset={onReset}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: /reset register/i,
      }),
    )

    expect(onReset).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Reset cancelled. Your current risks were not changed.',
    )
  })
})