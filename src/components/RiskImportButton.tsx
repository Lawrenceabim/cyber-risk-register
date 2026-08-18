import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import type { Risk } from '../types/risk'
import { parseRiskImport } from '../utils/riskImport'

export const maxRiskImportBytes = 1_000_000

interface RiskImportButtonProps {
  onImport: (risks: Risk[]) => void
}

export function RiskImportButton({
  onImport,
}: RiskImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isReading, setIsReading] = useState(false)

  const openFilePicker = () => {
    setStatusMessage('')
    fileInputRef.current?.click()
  }

  const handleFileSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const fileInput = event.currentTarget
    const selectedFile = fileInput.files?.[0]

    fileInput.value = ''

    if (!selectedFile) return

    if (selectedFile.size > maxRiskImportBytes) {
      setStatusMessage(
        'The selected file is too large. Choose a JSON export no larger than 1 MB.',
      )
      return
    }

    setStatusMessage('')
    setIsReading(true)

    try {
      const fileContents = await selectedFile.text()
      const result = parseRiskImport(fileContents)

      if (!result.ok) {
        setStatusMessage(result.error)
        return
      }

      const riskCountLabel = `${result.data.risks.length} ${
        result.data.risks.length === 1 ? 'risk' : 'risks'
      }`

      const replacementConfirmed = window.confirm(
        `Import ${riskCountLabel} from "${selectedFile.name}"? This will replace all risks currently in the register.`,
      )

      if (!replacementConfirmed) {
        setStatusMessage(
          'Import cancelled. Your existing risks were not changed.',
        )
        return
      }

      onImport(result.data.risks)

      setStatusMessage(
        `Imported ${riskCountLabel} from ${selectedFile.name}.`,
      )
    } catch {
      setStatusMessage(
        'The selected file could not be read. Please try again.',
      )
    } finally {
      setIsReading(false)
    }
  }

  return (
    <div
      className="risk-import-action"
      aria-busy={isReading}
    >
      <button
        type="button"
        className="risk-import-button"
        disabled={isReading}
        onClick={openFilePicker}
      >
        {isReading ? 'Reading file…' : 'Import JSON'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        aria-label="Choose risk register JSON file"
        hidden
        onChange={handleFileSelection}
      />

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