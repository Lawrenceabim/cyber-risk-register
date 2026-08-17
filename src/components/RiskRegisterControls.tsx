import { useRef } from 'react'
import {
  riskCategories,
  riskStatuses,
  type RiskCategory,
  type RiskStatus,
} from '../types/risk'
import {
  riskSortOptions,
  type RiskSortOption,
} from '../utils/sortRisks'

export type RiskStatusFilter = RiskStatus | 'all'
export type RiskCategoryFilter = RiskCategory | 'all'

interface RiskRegisterControlsProps {
  searchQuery: string
  statusFilter: RiskStatusFilter
  categoryFilter: RiskCategoryFilter
  sortOption: RiskSortOption
  onSearchChange: (query: string) => void
  onStatusChange: (status: RiskStatusFilter) => void
  onCategoryChange: (category: RiskCategoryFilter) => void
  onSortChange: (sortOption: RiskSortOption) => void
  onClear: () => void
}

export function RiskRegisterControls({
  searchQuery,
  statusFilter,
  categoryFilter,
  sortOption,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onClear,
}: RiskRegisterControlsProps) {
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
      aria-label="Filter and sort risk register"
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

      <div className="risk-filter">
        <label className="risk-filter__label" htmlFor="risk-sort">
          Sort by
        </label>

        <select
          className="risk-filter__select"
          id="risk-sort"
          value={sortOption}
          onChange={(event) =>
            onSortChange(event.target.value as RiskSortOption)
          }
        >
          {riskSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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