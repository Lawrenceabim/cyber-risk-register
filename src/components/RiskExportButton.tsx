import { useState } from 'react'
import type { Risk } from '../types/risk'
import { downloadRiskRegister } from '../utils/downloadRiskExport'

interface RiskExportButtonProps {
  risks: readonly Risk[]
}

export function RiskExportButton({
  risks,
}: RiskExportButtonProps) {
  const [statusMessage, setStatusMessage] = useState('')

  const handleExport = () => {
    try {
      const filename = downloadRiskRegister(risks)
      const riskCountLabel = `${risks.length} ${
        risks.length === 1 ? 'risk' : 'risks'
      }`

      setStatusMessage(
        `Exported ${riskCountLabel} to ${filename}.`,
      )
    } catch {
      setStatusMessage(
        'The risk register could not be exported. Please try again.',
      )
    }
  }

  return (
    <div className="risk-export-action">
      <button
        type="button"
        className="risk-export-button"
        onClick={handleExport}
      >
        Export JSON
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