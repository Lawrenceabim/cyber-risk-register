import { useState } from 'react'
import './App.css'
import { RiskSummary } from './components/RiskSummary'
import { RiskTable } from './components/RiskTable'
import { seedRisks } from './data/seedRisks'

const noMatchesEmptyState = {
  title: 'No risks match your search',
  description:
    'Try a different risk ID, title, category, owner or status.',
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const visibleRisks = normalizedQuery
    ? seedRisks.filter((risk) =>
        [
          risk.id,
          risk.title,
          risk.category,
          risk.owner,
          risk.status,
        ].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
    : seedRisks

  const riskCountLabel = `${visibleRisks.length} ${
    visibleRisks.length === 1 ? 'risk' : 'risks'
  }`

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

        <RiskSummary risks={seedRisks} />

        <section className="register-panel" aria-labelledby="register-title">
          <div className="register-panel__header">
            <div>
              <p className="section-heading__eyebrow">Portfolio</p>
              <h2 id="register-title">Risk register</h2>
            </div>

            <p
              className="register-count"
              aria-live="polite"
              aria-atomic="true"
            >
              {riskCountLabel}
            </p>
          </div>

          <div
            className="register-toolbar"
            role="search"
            aria-label="Search risk register"
          >
            <div className="risk-search">
              <label className="risk-search__label" htmlFor="risk-search">
                Search risks
              </label>

              <input
                className="risk-search__input"
                id="risk-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-describedby="risk-search-hint"
                placeholder="Search the register"
                autoComplete="off"
              />

              <p className="risk-search__hint" id="risk-search-hint">
                Matches risk ID, title, category, owner or status.
              </p>
            </div>
          </div>

          <RiskTable
            risks={visibleRisks}
            emptyState={normalizedQuery ? noMatchesEmptyState : undefined}
          />
        </section>
      </main>
    </div>
  )
}

export default App