export const riskStatuses = [
  'Open',
  'In treatment',
  'Mitigated',
  'Accepted',
] as const

export const riskCategories = [
  'Access control',
  'Application security',
  'Business continuity',
  'Data protection',
  'Security operations',
  'Third-party risk',
] as const

export type RiskStatus = (typeof riskStatuses)[number]
export type RiskCategory = (typeof riskCategories)[number]
export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type RiskLevel = 1 | 2 | 3 | 4 | 5

export interface Risk {
  id: string
  title: string
  description: string
  category: RiskCategory
  likelihood: RiskLevel
  impact: RiskLevel
  status: RiskStatus
  owner: string
  targetDate: string
  updatedAt: string
}

type RiskFactors = Pick<Risk, 'likelihood' | 'impact'>

export function calculateRiskScore({
  likelihood,
  impact,
}: RiskFactors): number {
  return likelihood * impact
}

export function getRiskSeverity(risk: RiskFactors): RiskSeverity {
  const score = calculateRiskScore(risk)

  if (score >= 20) return 'Critical'
  if (score >= 12) return 'High'
  if (score >= 6) return 'Medium'

  return 'Low'
}