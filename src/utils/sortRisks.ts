import type { Risk } from '../types/risk'
import { calculateRiskScore } from '../types/risk'

export const riskSortOptions = [
  {
    value: 'score-desc',
    label: 'Priority: highest first',
  },
  {
    value: 'target-date-asc',
    label: 'Target date: earliest first',
  },
  {
    value: 'title-asc',
    label: 'Title: A to Z',
  },
] as const

export type RiskSortOption = (typeof riskSortOptions)[number]['value']

const titleCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
})

function compareRiskIds(first: Risk, second: Risk): number {
  return first.id.localeCompare(second.id)
}

export function sortRisks(
  risks: readonly Risk[],
  sortOption: RiskSortOption,
): Risk[] {
  return [...risks].sort((first, second) => {
    switch (sortOption) {
      case 'score-desc': {
        const scoreDifference =
          calculateRiskScore(second) - calculateRiskScore(first)

        return scoreDifference || compareRiskIds(first, second)
      }

      case 'target-date-asc': {
        const dateDifference = first.targetDate.localeCompare(
          second.targetDate,
        )

        return dateDifference || compareRiskIds(first, second)
      }

      case 'title-asc': {
        const titleDifference = titleCollator.compare(
          first.title,
          second.title,
        )

        return titleDifference || compareRiskIds(first, second)
      }

      default: {
        const exhaustiveCheck: never = sortOption
        throw new Error(`Unsupported risk sort option: ${exhaustiveCheck}`)
      }
    }
  })
}