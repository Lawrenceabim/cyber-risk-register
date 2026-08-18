import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { RiskDetailsDialog } from './RiskDetailsDialog'

describe('RiskDetailsDialog editing', () => {
  it('offers editing and calls its handler', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <RiskDetailsDialog
        risk={seedRisks[0]}
        onClose={vi.fn()}
        onEdit={onEdit}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /edit risk/i }),
    )

    expect(onEdit).toHaveBeenCalledOnce()
  })
})