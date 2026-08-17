import type { Risk } from '../types/risk'
import { getRiskSeverity } from '../types/risk'

interface RiskSummaryProps {
  risks: readonly Risk[]
}

export function RiskSummary({ risks }: RiskSummaryProps) {
  const overviewItems = [
    {
      id: 'total',
      label: 'Total risks',
      value: risks.length,
      detail: 'Across the register',
    },
    {
      id: 'critical',
      label: 'Critical risks',
      value: risks.filter((risk) => getRiskSeverity(risk) === 'Critical')
        .length,
      detail: 'Require immediate attention',
    },
    {
      id: 'active',
      label: 'Active risks',
      value: risks.filter(
        (risk) => risk.status === 'Open' || risk.status === 'In treatment',
      ).length,
      detail: 'Open or in treatment',
    },
    {
      id: 'mitigated',
      label: 'Mitigated risks',
      value: risks.filter((risk) => risk.status === 'Mitigated').length,
      detail: 'Treatment completed',
    },
  ]

  return (
    <section aria-labelledby="risk-overview-title">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Current posture</p>
          <h2 id="risk-overview-title">Risk overview</h2>
        </div>
        <p>Metrics update automatically as the register changes.</p>
      </div>

      <div className="overview-grid">
        {overviewItems.map((item) => (
          <article
            className="metric-card"
            aria-labelledby={`metric-${item.id}`}
            key={item.id}
          >
            <h3 id={`metric-${item.id}`}>{item.label}</h3>
            <p className="metric-card__value">{item.value}</p>
            <p className="metric-card__detail">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}