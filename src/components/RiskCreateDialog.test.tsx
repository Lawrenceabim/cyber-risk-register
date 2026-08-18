import { useState } from 'react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { riskToDraft } from '../utils/riskDraft'
import { RiskCreateDialog } from './RiskCreateDialog'

describe('RiskCreateDialog', () => {
  it('renders accessible risk fields and focuses the title', () => {
    render(
      <RiskCreateDialog
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: /add a risk/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('textbox', { name: /risk title/i }),
    ).toHaveFocus()

    expect(
      screen.getByRole('combobox', { name: /category/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('combobox', { name: /likelihood/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('combobox', { name: /impact/i }),
    ).toBeInTheDocument()
  })

  it('reports invalid fields and focuses the first one', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <RiskCreateDialog
        onSave={onSave}
        onClose={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /create risk/i }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      /review the highlighted fields/i,
    )
    expect(
      screen.getByRole('textbox', { name: /risk title/i }),
    ).toHaveFocus()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('submits a complete risk draft', () => {
    const onSave = vi.fn()

    render(
      <RiskCreateDialog
        onSave={onSave}
        onClose={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', {
      name: /add a risk/i,
    })

    fireEvent.change(
      within(dialog).getByRole('textbox', {
        name: /risk title/i,
      }),
      {
        target: {
          value: 'Cloud administrator access is over-permissioned',
        },
      },
    )

    fireEvent.change(
      within(dialog).getByRole('textbox', {
        name: /description/i,
      }),
      {
        target: {
          value:
            'Several cloud administrator roles include unnecessary permissions.',
        },
      },
    )

    fireEvent.change(
      within(dialog).getByRole('combobox', {
        name: /category/i,
      }),
      {
        target: { value: 'Access control' },
      },
    )

    fireEvent.change(
      within(dialog).getByRole('textbox', {
        name: /owner/i,
      }),
      {
        target: { value: 'Cloud security team' },
      },
    )

    fireEvent.change(
      within(dialog).getByRole('combobox', {
        name: /likelihood/i,
      }),
      {
        target: { value: '4' },
      },
    )

    fireEvent.change(
      within(dialog).getByRole('combobox', {
        name: /impact/i,
      }),
      {
        target: { value: '5' },
      },
    )

    fireEvent.change(
      within(dialog).getByLabelText(/target date/i),
      {
        target: { value: '2026-11-15' },
      },
    )

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: /create risk/i,
      }),
    )

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({
      title: 'Cloud administrator access is over-permissioned',
      description:
        'Several cloud administrator roles include unnecessary permissions.',
      category: 'Access control',
      likelihood: 4,
      impact: 5,
      owner: 'Cloud security team',
      targetDate: '2026-11-15',
    })
  })

  it('closes with Escape and restores focus to the opener', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [isOpen, setIsOpen] = useState(false)

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Add risk
          </button>

          {isOpen ? (
            <RiskCreateDialog
              onSave={vi.fn()}
              onClose={() => setIsOpen(false)}
            />
          ) : null}
        </>
      )
    }

    render(<Harness />)

    const opener = screen.getByRole('button', {
      name: /add risk/i,
    })

    await user.click(opener)

    expect(
      screen.getByRole('textbox', { name: /risk title/i }),
    ).toHaveFocus()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(opener).toHaveFocus()
    })
  })

  it('supports prefilled values and custom editing copy', () => {
    const onSave = vi.fn()
    const initialDraft = riskToDraft(seedRisks[0])

    render(
      <RiskCreateDialog
        initialDraft={initialDraft}
        eyebrow="Existing record"
        heading="Edit risk"
        description="Update this risk record."
        submitLabel="Save changes"
        onSave={onSave}
        onClose={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', {
      name: /edit risk/i,
    })

    const titleInput = within(dialog).getByRole('textbox', {
      name: /risk title/i,
    })

    expect(titleInput).toHaveValue(initialDraft.title)

    fireEvent.change(titleInput, {
      target: {
        value:
          'Privileged accounts require stronger authentication',
      },
    })

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: /save changes/i,
      }),
    )

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({
      ...initialDraft,
      title:
        'Privileged accounts require stronger authentication',
    })
  })
})