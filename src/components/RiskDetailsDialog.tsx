import { useEffect, useId, useRef } from 'react'
import type { Risk } from '../types/risk'
import { calculateRiskScore, getRiskSeverity } from '../types/risk'

interface RiskDetailsDialogProps {
  risk: Risk
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

export function RiskDetailsDialog({
  risk,
  onClose,
}: RiskDetailsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  const score = calculateRiskScore(risk)
  const severity = getRiskSeverity(risk)

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )

      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement =
        focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousBodyOverflow
      previouslyFocused?.focus()
    }
  }, [onClose])

  function handleBackdropMouseDown(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className="risk-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className="risk-dialog__header">
          <div>
            <p className="risk-dialog__eyebrow">{risk.id}</p>
            <h2 id={titleId}>{risk.title}</h2>
          </div>

          <button
            ref={closeButtonRef}
            className="risk-dialog__close"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="risk-dialog__description" id={descriptionId}>
          {risk.description}
        </p>

        <dl className="risk-dialog__details">
          <div>
            <dt>Severity</dt>
            <dd>
              {severity} — Score {score}
            </dd>
          </div>

          <div>
            <dt>Status</dt>
            <dd>{risk.status}</dd>
          </div>

          <div>
            <dt>Category</dt>
            <dd>{risk.category}</dd>
          </div>

          <div>
            <dt>Owner</dt>
            <dd>{risk.owner}</dd>
          </div>

          <div>
            <dt>Likelihood</dt>
            <dd>{risk.likelihood} of 5</dd>
          </div>

          <div>
            <dt>Impact</dt>
            <dd>{risk.impact} of 5</dd>
          </div>

          <div>
            <dt>Target date</dt>
            <dd>
              <time dateTime={risk.targetDate}>
                {formatDate(risk.targetDate)}
              </time>
            </dd>
          </div>

          <div>
            <dt>Last updated</dt>
            <dd>
              <time dateTime={risk.updatedAt}>
                {formatDate(risk.updatedAt)}
              </time>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}