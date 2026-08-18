import type { Risk } from '../types/risk'
import {
  getRiskExportFilename,
  serializeRiskRegister,
} from './riskExport'

export function downloadRiskRegister(
  risks: readonly Risk[],
  now: Date = new Date(),
): string {
  const filename = getRiskExportFilename(now)
  const blob = new Blob(
    [serializeRiskRegister(risks, now)],
    {
      type: 'application/json;charset=utf-8',
    },
  )
  const objectUrl = URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')

  downloadLink.href = objectUrl
  downloadLink.download = filename
  downloadLink.hidden = true

  document.body.append(downloadLink)

  try {
    downloadLink.click()
  } finally {
    downloadLink.remove()
    URL.revokeObjectURL(objectUrl)
  }

  return filename
}