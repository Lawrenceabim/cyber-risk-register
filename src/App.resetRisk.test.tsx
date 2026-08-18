import {
  render,
  screen,
  waitFor,
  within,
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
import { riskStorageKey } from './hooks/usePersistentRisks'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App risk reset', () => {
  it('restores and persists the original demo register', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true)

    const customRisks = [
      {
        ...seedRisks[0],
        id: 'RISK-900',
        title: 'Temporary imported risk',
        owner: 'Temporary owner',
      },
    ]

    window.localStorage.setItem(
      riskStorageKey,
      JSON.stringify(customRisks),
    )

    render(<App />)

    expect(screen.getByText('1 risk')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /reset register/i,
      }),
    )

    await waitFor(() => {
      expect(screen.getByText('5 risks')).toBeInTheDocument()
    })

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    expect(
      within(table).getByText('RISK-001'),
    ).toBeInTheDocument()

    expect(
      within(table).getByText('RISK-005'),
    ).toBeInTheDocument()

    expect(
      within(table).queryByText('RISK-900'),
    ).not.toBeInTheDocument()

    expect(confirmSpy).toHaveBeenCalledOnce()

    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(riskStorageKey) ??
            '[]',
        ),
      ).toEqual(seedRisks)
    })

    expect(customRisks).toHaveLength(1)
    expect(customRisks[0].id).toBe('RISK-900')
  })
})