import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { RiskDetailsDialog } from './RiskDetailsDialog'

describe('RiskDetailsDialog deletion', () => {
  it('requires confirmation and supports cancelling safely', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <RiskDetailsDialog
        risk={seedRisks[0]}
        onClose={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /^delete risk$/i }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      /this action cannot be undone/i,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /keep risk/i }),
      ).toHaveFocus()
    })

    expect(onDelete).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: /keep risk/i }),
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^delete risk$/i }),
      ).toHaveFocus()
    })
  })

  it('calls the deletion handler after explicit confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <RiskDetailsDialog
        risk={seedRisks[0]}
        onClose={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /^delete risk$/i }),
    )

    await user.click(
      screen.getByRole('button', {
        name: /confirm delete risk-001/i,
      }),
    )

    expect(onDelete).toHaveBeenCalledOnce()
  })
})