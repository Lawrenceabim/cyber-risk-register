import { useState } from 'react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RiskCreateDialog } from './RiskCreateDialog'

describe('RiskCreateDialog', () => {
  it('renders accessible risk fields and focuses the title', () => {
    render(
      <RiskCreateDialog
        onCreate={vi.fn()}
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
    const onCreate = vi.fn()

    render(
      <RiskCreateDialog
        onCreate={onCreate}
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
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('submits a complete risk draft', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <RiskCreateDialog
        onCreate={onCreate}
        onClose={vi.fn()}
      />,
    )

    await user.type(
      screen.getByRole('textbox', { name: /risk title/i }),
      'Cloud administrator access is over-permissioned',
    )

    await user.type(
      screen.getByRole('textbox', { name: /description/i }),
      'Several cloud administrator roles include unnecessary permissions.',
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: /category/i }),
      'Access control',
    )

    await user.type(
      screen.getByRole('textbox', { name: /owner/i }),
      'Cloud security team',
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: /likelihood/i }),
      '4',
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: /impact/i }),
      '5',
    )

    fireEvent.change(
      screen.getByLabelText(/target date/i),
      {
        target: { value: '2026-11-15' },
      },
    )

    await user.click(
      screen.getByRole('button', { name: /create risk/i }),
    )

    expect(onCreate).toHaveBeenCalledWith({
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
              onCreate={vi.fn()}
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
})