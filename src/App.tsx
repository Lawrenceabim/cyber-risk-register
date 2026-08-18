import { useCallback, useRef, useState } from 'react'
import './App.css'
import { usePersistentRisks } from './hooks/usePersistentRisks'
import { RiskDetailsDialog } from './components/RiskDetailsDialog'
import {
  RiskRegisterControls,
  type RiskCategoryFilter,
  type RiskStatusFilter,
} from './components/RiskRegisterControls'
import { RiskSummary } from './components/RiskSummary'
import { RiskTable } from './components/RiskTable'
import { seedRisks } from './data/seedRisks'
import type { Risk, RiskStatus } from './types/risk'
import {
  sortRisks,
  type RiskSortOption,
} from './utils/sortRisks'

const noMatchesEmptyState = {
  title: 'No risks match your filters',
  description: 'Try adjusting the search term, status or category.',
}

function App() {
  const [risks, setRisks] = usePersistentRisks(seedRisks)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<RiskStatusFilter>('all')
  const [categoryFilter, setCategoryFilter] =
    useState<RiskCategoryFilter>('all')
  const [sortOption, setSortOption] =
    useState<RiskSortOption>('score-desc')
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(
    null,
  )
  const registerHeadingRef = useRef<HTMLHeadingElement>(null)

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      [
        risk.id,
        risk.title,
        risk.category,
        risk.owner,
        risk.status,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))

    const matchesStatus =
      statusFilter === 'all' || risk.status === statusFilter

    const matchesCategory =
      categoryFilter === 'all' || risk.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const visibleRisks = sortRisks(filteredRisks, sortOption)

  const selectedRisk =
    selectedRiskId === null
      ? null
      : risks.find((risk) => risk.id === selectedRiskId) ?? null

  const hasActiveFilters =
    normalizedQuery.length > 0 ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all'

  const riskCountLabel = `${visibleRisks.length} ${
    visibleRisks.length === 1 ? 'risk' : 'risks'
  }`

  const openRiskDetails = useCallback((risk: Risk) => {
    setSelectedRiskId(risk.id)
  }, [])

  const closeRiskDetails = useCallback(() => {
    setSelectedRiskId(null)
  }, [])

  const updateSelectedRiskStatus = useCallback(
    (status: RiskStatus) => {
      if (selectedRiskId === null) return

      const updatedAt = new Date().toISOString().slice(0, 10)

      setRisks((currentRisks) =>
        currentRisks.map((risk) =>
          risk.id === selectedRiskId
            ? {
                ...risk,
                status,
                updatedAt,
              }
            : risk,
        ),
      )
    },
    [setRisks, selectedRiskId],
  )

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
  }

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

        <RiskSummary risks={risks} />

        <section className="register-panel" aria-labelledby="register-title">
          <div className="register-panel__header">
            <div>
              <p className="section-heading__eyebrow">Portfolio</p>
              <h2
                ref={registerHeadingRef}
                id="register-title"
                tabIndex={-1}
              >
                Risk register
              </h2>
            </div>

            <p
              className="register-count"
              aria-live="polite"
              aria-atomic="true"
            >
              {riskCountLabel}
            </p>
          </div>

          <RiskRegisterControls
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            sortOption={sortOption}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onCategoryChange={setCategoryFilter}
            onSortChange={setSortOption}
            onClear={clearFilters}
          />

          <RiskTable
            risks={visibleRisks}
            emptyState={hasActiveFilters ? noMatchesEmptyState : undefined}
            onViewRisk={openRiskDetails}
          />
        </section>
      </main>

      {selectedRisk ? (
        <RiskDetailsDialog
          risk={selectedRisk}
          onClose={closeRiskDetails}
          onStatusChange={updateSelectedRiskStatus}
          returnFocusFallbackRef={registerHeadingRef}
        />
      ) : null}
    </div>
  )
}

export default App