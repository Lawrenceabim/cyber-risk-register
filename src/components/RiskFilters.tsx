import { useRef } from 'react'
import {
  riskCategories,
  riskStatuses,
  type RiskCategory,
  type RiskStatus,
} from '../types/risk'

export type RiskStatusFilter = RiskStatus | 'all'
export type RiskCategoryFilter = RiskCategory | 'all'

interface RiskFiltersProps {
  searchQuery: string
  statusFilter: RiskStatusFilter
  categoryFilter: RiskCategoryFilter
  onSearchChange: (query: string) => void
  onStatusChange: (status: RiskStatusFilter) => void
  onCategoryChange: (category: RiskCategoryFilter) => void
  onClear: () => void
}

export function RiskFilters({
  searchQuery,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onClear,
}: RiskFiltersProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all'

  function handleClear() {
    onClear()
    searchInputRef.current?.focus()
  }

  return (
    <div
      className="register-toolbar"
      role="search"
      aria-label="Filter risk register"
    >
      <div className="risk-search">
        <label className="risk-search__label" htmlFor="risk-search">
          Search risks
        </label>

        <input
          ref={searchInputRef}
          className="risk-search__input"
          id="risk-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-describedby="risk-search-hint"
          placeholder="Search the register"
          autoComplete="off"
        />

        <p className="risk-search__hint" id="risk-search-hint">
          Matches risk ID, title, category, owner or status.
        </p>
      </div>

      <div className="risk-filter">
        <label className="risk-filter__label" htmlFor="risk-status-filter">
          Status
        </label>

        <select
          className="risk-filter__select"
          id="risk-status-filter"
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value as RiskStatusFilter)
          }
        >
          <option value="all">All statuses</option>
          {riskStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="risk-filter">
        <label className="risk-filter__label" htmlFor="risk-category-filter">
          Category
        </label>

        <select
          className="risk-filter__select"
          id="risk-category-filter"
          value={categoryFilter}
          onChange={(event) =>
            onCategoryChange(event.target.value as RiskCategoryFilter)
          }
        >
          <option value="all">All categories</option>
          {riskCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <button
        className="filter-clear"
        type="button"
        onClick={handleClear}
        disabled={!hasActiveFilters}
      >
        Clear filters
      </button>
    </div>
  )
}