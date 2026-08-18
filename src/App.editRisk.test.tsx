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
import { seedRisks } from './data/seedRisks'
import { riskStorageKey } from './hooks/usePersistentRisks'

describe('App risk editing', () => {
  it('edits, recalculates and persists a risk immutably', async () => {
    const user = userEvent.setup()

    render(<App />)

    const table = screen.getByRole('table', {
      name: /cybersecurity risk register/i,
    })

    const originalRow = within(table).getByRole('row', {
      name: /risk-001/i,
    })

    await user.click(
      within(originalRow).getByRole('button', {
        name: /view details/i,
      }),
    )

    const detailsDialog = screen.getByRole('dialog', {
      name: /privileged accounts lack phishing-resistant mfa/i,
    })

    await user.click(
      within(detailsDialog).getByRole('button', {
        name: /edit risk/i,
      }),
    )

    const editDialog = await screen.findByRole('dialog', {
      name: /edit risk/i,
    })

    const titleInput = within(editDialog).getByRole('textbox', {
      name: /risk title/i,
    })

    expect(titleInput).toHaveValue(seedRisks[0].title)

    fireEvent.change(titleInput, {
      target: {
        value:
          'Privileged accounts require stronger authentication',
      },
    })

    const ownerInput = within(editDialog).getByRole('textbox', {
      name: /owner/i,
    })

    fireEvent.change(ownerInput, {
      target: {
        value: 'Identity governance team',
      },
    })

    fireEvent.change(
      within(editDialog).getByRole('combobox', {
        name: /likelihood/i,
      }),
      {
        target: {
          value: '3',
        },
      },
    )

    await user.click(
      within(editDialog).getByRole('button', {
        name: /save changes/i,
      }),
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: /edit risk/i,
        }),
      ).not.toBeInTheDocument()
    })

    const updatedRow = within(table).getByRole('row', {
      name: /risk-001/i,
    })

    expect(
      within(updatedRow).getByText(
        'Privileged accounts require stronger authentication',
      ),
    ).toBeInTheDocument()

    expect(
      within(updatedRow).getByText(
        'Identity governance team',
      ),
    ).toBeInTheDocument()

    expect(
      within(updatedRow).getByText('High'),
    ).toBeInTheDocument()

    expect(
      within(updatedRow).getByText('Score 15'),
    ).toBeInTheDocument()

    expect(
      within(updatedRow).getByText('Open'),
    ).toBeInTheDocument()

    const criticalCard = screen.getByRole('article', {
      name: /critical risks/i,
    })

    expect(
      within(criticalCard).getByText('0'),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        within(updatedRow).getByRole('button', {
          name: /view details/i,
        }),
      ).toHaveFocus()
    })

    await waitFor(() => {
      const savedRisks = JSON.parse(
        window.localStorage.getItem(riskStorageKey) ?? '[]',
      ) as Array<{
        id: string
        title: string
        likelihood: number
        status: string
      }>

      expect(
        savedRisks.find((risk) => risk.id === 'RISK-001'),
      ).toMatchObject({
        id: 'RISK-001',
        title:
          'Privileged accounts require stronger authentication',
        likelihood: 3,
        status: 'Open',
      })
    })

    expect(seedRisks[0].title).toBe(
      'Privileged accounts lack phishing-resistant MFA',
    )
  })
})