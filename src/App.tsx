import './App.css'

const overviewItems = [
  {
    label: 'Total risks',
    value: 0,
    detail: 'Across the register',
  },
  {
    label: 'Critical risks',
    value: 0,
    detail: 'Require immediate attention',
  },
  {
    label: 'Open risks',
    value: 0,
    detail: 'Awaiting treatment',
  },
  {
    label: 'Mitigated risks',
    value: 0,
    detail: 'Treatment completed',
  },
] as const

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              CR
            </span>

            <span className="brand__copy">
              <span className="brand__name">Cyber Risk Register</span>
              <span className="brand__tagline">Risk oversight workspace</span>
            </span>
          </div>

          <span className="workspace-badge">
            <span className="workspace-badge__dot" aria-hidden="true" />
            Local workspace
          </span>
        </div>
      </header>

      <main id="main-content" className="main-content">
        <section className="page-intro" aria-labelledby="page-title">
          <p className="page-intro__eyebrow">
            Governance, risk and compliance
          </p>
          <h1 id="page-title">Understand and prioritize cyber risk</h1>
          <p className="page-intro__description">
            Maintain a clear view of security risks, ownership and treatment
            progress in one focused workspace.
          </p>
        </section>

        <section aria-labelledby="risk-overview-title">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">Current posture</p>
              <h2 id="risk-overview-title">Risk overview</h2>
            </div>
            <p>Metrics will update as the register changes.</p>
          </div>

          <dl className="overview-grid">
            {overviewItems.map((item) => (
              <div className="metric-card" key={item.label}>
                <dt>{item.label}</dt>
                <dd className="metric-card__value">{item.value}</dd>
                <dd className="metric-card__detail">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="register-panel" aria-labelledby="register-title">
          <div className="register-panel__header">
            <div>
              <p className="section-heading__eyebrow">Risk register</p>
              <h2 id="register-title">No risks recorded yet</h2>
            </div>
            <p className="register-count">0 risks</p>
          </div>

          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 3 5 6v5c0 4.6 2.9 8.4 7 10 4.1-1.6 7-5.4 7-10V6l-7-3Z" />
                <path d="m9.5 12 1.7 1.7 3.5-4" />
              </svg>
            </span>

            <div>
              <h3>Start with your highest-priority risk</h3>
              <p>
                Risk records will appear here with their severity, owner,
                status and treatment progress.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App