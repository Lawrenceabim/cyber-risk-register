import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { riskStorageKey } from './hooks/usePersistentRisks'

describe('App risk creation', () => {
  it('creates, displays and persists a validated risk', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(
      screen.getByRole('button', { name: /add risk/i }),
    )

    const dialog = screen.getByRole('dialog', {
      name: /add a risk/i,
    })

    await user.type(
      within(dialog).getByRole('textbox', {
        name: /risk title/i,
      }),
      'Cloud administrator access is over-permissioned',
    )

    await user.type(
      within(dialog).getByRole('textbox', {
        name: /description/i,
      }),
      'Several cloud administrator roles include unnecessary permissions.',
    )

    await user.selectOptions(
      within(dialog).getByRole('combobox', {
        name: /category/i,
      }),
      'Access control',
    )

    await user.type(
      within(dialog).getByRole('textbox', {
        name: /owner/i,
      }),
      'Cloud security team',
    )

    await user.selectOptions(
      within(dialog).getByRole('combobox', {
        name: /likelihood/i,
      }),
      '4',
    )

    await user.selectOptions(
      within(dialog).getByRole('combobox', {
        name: /impact/i,
      }),
      '5',
    )

    fireEvent.change(
      within(dialog).getByLabelText(/target date/i),
      {
        target: { value: '2026-11-15' },
      },
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: /create risk/i,
      }),
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /add a risk/i }),
      ).not.toBeInTheDocument()
    })

    expect(screen.getByText('6 risks')).toBeInTheDocument()

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    const createdRow = within(table).getByRole('row', {
      name: /risk-006/i,
    })

    expect(
      within(createdRow).getByText(
        'Cloud administrator access is over-permissioned',
      ),
    ).toBeInTheDocument()

    expect(
      within(createdRow).getByText('Critical'),
    ).toBeInTheDocument()

    expect(
      within(createdRow).getByText('Open'),
    ).toBeInTheDocument()

    await waitFor(() => {
      const savedRisks = JSON.parse(
        window.localStorage.getItem(riskStorageKey) ?? '[]',
      ) as Array<{ id: string; title: string }>

      expect(savedRisks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'RISK-006',
            title:
              'Cloud administrator access is over-permissioned',
          }),
        ]),
      )
    })
  })
})