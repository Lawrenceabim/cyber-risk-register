import type { Risk, RiskSeverity, RiskStatus } from '../types/risk'
import { calculateRiskScore, getRiskSeverity } from '../types/risk'
import {
  getRiskTimeline,
  type RiskTimelineState,
} from '../utils/riskTimeline'

interface EmptyStateContent {
  title: string
  description: string
}

interface RiskTableProps {
  risks: readonly Risk[]
  emptyState?: EmptyStateContent
  onViewRisk?: (risk: Risk) => void
  today?: string
}

const defaultEmptyState: EmptyStateContent = {
  title: 'Start with your highest-priority risk',
  description:
    'Risk records will appear here with their severity, owner, status and target date.',
}

const severityClassNames: Record<RiskSeverity, string> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
}

const statusClassNames: Record<RiskStatus, string> = {
  Open: 'open',
  'In treatment': 'in-treatment',
  Mitigated: 'mitigated',
  Accepted: 'accepted',
}

const timelineClassNames: Record<RiskTimelineState, string> = {
  Completed: 'completed',
  Accepted: 'accepted',
  Overdue: 'overdue',
  'Due soon': 'due-soon',
  'On track': 'on-track',
}

const targetDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatTargetDate(targetDate: string): string {
  return targetDateFormatter.format(new Date(`${targetDate}T00:00:00Z`))
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function RiskTable({
  risks,
  emptyState = defaultEmptyState,
  onViewRisk,
  today = getTodayIsoDate(),
}: RiskTableProps) {
  if (risks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-state__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 3 5 6v5c0 4.6 2.9 8.4 7 10 4.1-1.6 7-5.4 7-10V6l-7-3Z" />
            <path d="m9.5 12 1.7 1.7 3.5-4" />
          </svg>
        </span>

        <div>
          <h3>{emptyState.title}</h3>
          <p>{emptyState.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="risk-table-scroll"
      role="region"
      aria-label="Risk register table"
      tabIndex={0}
    >
      <table className="risk-table">
        <caption className="visually-hidden">
          Cybersecurity risk register
        </caption>

        <thead>
          <tr>
            <th scope="col">Risk</th>
            <th scope="col">Severity</th>
            <th scope="col">Owner</th>
            <th scope="col">Status</th>
            <th scope="col">Timeline</th>
            <th scope="col">Target date</th>
            {onViewRisk ? <th scope="col">Actions</th> : null}
          </tr>
        </thead>

        <tbody>
          {risks.map((risk) => {
            const severity = getRiskSeverity(risk)
            const score = calculateRiskScore(risk)
            const timeline = getRiskTimeline(risk, today)

            return (
              <tr key={risk.id}>
                <th className="risk-identity" scope="row">
                  <span className="risk-id">{risk.id}</span>
                  <span className="risk-title">{risk.title}</span>
                  <span className="risk-category">{risk.category}</span>
                </th>

                <td>
                  <div className="severity-cell">
                    <span
                      className={`severity-badge severity-badge--${severityClassNames[severity]}`}
                    >
                      {severity}
                    </span>
                    <span className="risk-score">Score {score}</span>
                  </div>
                </td>

                <td>
                  <span className="risk-owner">{risk.owner}</span>
                </td>

                <td>
                  <span
                    className={`status-badge status-badge--${statusClassNames[risk.status]}`}
                  >
                    {risk.status}
                  </span>
                </td>

                <td>
                  <div className="timeline-cell">
                    <span
                      className={`timeline-badge timeline-badge--${timelineClassNames[timeline.state]}`}
                    >
                      {timeline.state}
                    </span>
                    <span className="timeline-detail">
                      {timeline.detail}
                    </span>
                  </div>
                </td>

                <td>
                  <time dateTime={risk.targetDate}>
                    {formatTargetDate(risk.targetDate)}
                  </time>
                </td>

                {onViewRisk ? (
                  <td className="risk-actions">
                    <button
                      className="risk-action-button"
                      type="button"
                      onClick={() => onViewRisk(risk)}
                      aria-label={`View details for ${risk.id}: ${risk.title}`}
                    >
                      View details
                    </button>
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}