import { useState } from 'react'

interface RiskResetButtonProps {
  defaultRiskCount: number
  onReset: () => void
}

export function RiskResetButton({
  defaultRiskCount,
  onReset,
}: RiskResetButtonProps) {
  const [statusMessage, setStatusMessage] = useState('')

  const handleReset = () => {
    const riskCountLabel = `${defaultRiskCount} ${
      defaultRiskCount === 1 ? 'risk' : 'risks'
    }`

    const resetConfirmed = window.confirm(
      `Reset the register to ${riskCountLabel}? This will replace all current risks with the original demo data.`,
    )

    if (!resetConfirmed) {
      setStatusMessage(
        'Reset cancelled. Your current risks were not changed.',
      )
      return
    }

    onReset()

    setStatusMessage(
      `Restored ${riskCountLabel} from the original demo data.`,
    )
  }

  return (
    <div className="risk-reset-action">
      <button
        type="button"
        className="risk-reset-button"
        onClick={handleReset}
      >
        Reset register
      </button>

      <p
        className="visually-hidden"
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </div>
  )
}