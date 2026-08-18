import { useCallback, useRef, useState } from 'react'
import './App.css'
import { RiskCreateDialog } from './components/RiskCreateDialog'
import { RiskDetailsDialog } from './components/RiskDetailsDialog'
import { RiskExportButton } from './components/RiskExportButton'
import { RiskImportButton } from './components/RiskImportButton'
import { RiskResetButton } from './components/RiskResetButton'
import {
  RiskRegisterControls,
  type RiskCategoryFilter,
  type RiskStatusFilter,
} from './components/RiskRegisterControls'
import { RiskSummary } from './components/RiskSummary'
import { RiskTable } from './components/RiskTable'
import { seedRisks } from './data/seedRisks'
import { usePersistentRisks } from './hooks/usePersistentRisks'
import type { Risk, RiskStatus } from './types/risk'
import {
  createRiskFromDraft,
  riskToDraft,
  type RiskDraft,
  updateRiskFromDraft,
} from './utils/riskDraft'
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
  const [editingRiskId, setEditingRiskId] = useState<string | null>(
    null,
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false)
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

  const editingRisk =
    editingRiskId === null
      ? null
      : risks.find((risk) => risk.id === editingRiskId) ?? null

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

  const openRiskEditor = useCallback(() => {
    if (selectedRiskId === null) return

    setEditingRiskId(selectedRiskId)
    setSelectedRiskId(null)
  }, [selectedRiskId])

  const closeRiskEditor = useCallback(() => {
    setEditingRiskId(null)
  }, [])

  const openRiskCreator = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  const closeRiskCreator = useCallback(() => {
    setIsCreateDialogOpen(false)
  }, [])

  const createRisk = useCallback(
    (draft: RiskDraft) => {
      setRisks((currentRisks) => [
        ...currentRisks,
        createRiskFromDraft(draft, currentRisks),
      ])

      setSearchQuery('')
      setStatusFilter('all')
      setCategoryFilter('all')
      setIsCreateDialogOpen(false)
    },
    [setRisks],
  )

  const saveEditedRisk = useCallback(
    (draft: RiskDraft) => {
      if (editingRiskId === null) return

      setRisks((currentRisks) =>
        currentRisks.map((risk) =>
          risk.id === editingRiskId
            ? updateRiskFromDraft(risk, draft)
            : risk,
        ),
      )

      setEditingRiskId(null)
    },
    [editingRiskId, setRisks],
  )

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
    [selectedRiskId, setRisks],
  )

  const deleteSelectedRisk = useCallback(() => {
    if (selectedRiskId === null) return

    setRisks((currentRisks) =>
      currentRisks.filter((risk) => risk.id !== selectedRiskId),
    )

    setSelectedRiskId(null)
  }, [selectedRiskId, setRisks])

    const importRisks = useCallback(
      (importedRisks: Risk[]) => {
        setRisks(
          importedRisks.map((risk) => ({ ...risk })),
        )
        setSearchQuery('')
        setStatusFilter('all')
        setCategoryFilter('all')
        setSortOption('score-desc')
        setSelectedRiskId(null)
        setEditingRiskId(null)
        setIsCreateDialogOpen(false)
      },
      [setRisks],
    )

    const resetRisks = useCallback(() => {
      setRisks(
        seedRisks.map((risk) => ({ ...risk })),
      )
      setSearchQuery('')
      setStatusFilter('all')
      setCategoryFilter('all')
      setSortOption('score-desc')
      setSelectedRiskId(null)
      setEditingRiskId(null)
      setIsCreateDialogOpen(false)
    }, [setRisks])

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
              <span className="brand__name">
                Cyber Risk Register
              </span>
              <span className="brand__tagline">
                Risk oversight workspace
              </span>
            </span>
          </div>

          <span className="workspace-badge">
            <span
              className="workspace-badge__dot"
              aria-hidden="true"
            />
            Local workspace
          </span>
        </div>
      </header>

      <main id="main-content" className="main-content">
        <section className="page-intro" aria-labelledby="page-title">
          <p className="page-intro__eyebrow">
            Governance, risk and compliance
          </p>
          <h1 id="page-title">
            Understand and prioritize cyber risk
          </h1>
          <p className="page-intro__description">
            Maintain a clear view of security risks, ownership and
            treatment progress in one focused workspace.
          </p>
        </section>

        <RiskSummary risks={risks} />

        <section
          className="register-panel"
          aria-labelledby="register-title"
        >
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

            <div className="register-panel__actions">
              <p
                className="register-count"
                aria-live="polite"
                aria-atomic="true"
              >
                {riskCountLabel}
              </p>
               <RiskExportButton risks={risks} />
                             <RiskImportButton onImport={importRisks} />

              <RiskResetButton
                defaultRiskCount={seedRisks.length}
                onReset={resetRisks}
              />

              <button
                className="add-risk-button"
                type="button"
                onClick={openRiskCreator}
              >
                Add risk
              </button>
            </div>
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
            emptyState={
              hasActiveFilters ? noMatchesEmptyState : undefined
            }
            onViewRisk={openRiskDetails}
          />
        </section>
      </main>

      {selectedRisk ? (
        <RiskDetailsDialog
          risk={selectedRisk}
          onClose={closeRiskDetails}
          onStatusChange={updateSelectedRiskStatus}
          onEdit={openRiskEditor}
          onDelete={deleteSelectedRisk}
          returnFocusFallbackRef={registerHeadingRef}
        />
      ) : null}

      {isCreateDialogOpen ? (
        <RiskCreateDialog
          onSave={createRisk}
          onClose={closeRiskCreator}
          returnFocusFallbackRef={registerHeadingRef}
        />
      ) : null}

      {editingRisk ? (
        <RiskCreateDialog
          key={editingRisk.id}
          initialDraft={riskToDraft(editingRisk)}
          eyebrow={editingRisk.id}
          heading="Edit risk"
          description="Update this risk record. Its identifier and current status will be preserved."
          submitLabel="Save changes"
          onSave={saveEditedRisk}
          onClose={closeRiskEditor}
          returnFocusFallbackRef={registerHeadingRef}
        />
      ) : null}
    </div>
  )
}

export default App