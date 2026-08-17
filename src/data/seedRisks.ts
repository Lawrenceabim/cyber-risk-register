import type { Risk } from '../types/risk'

export const seedRisks: Risk[] = [
  {
    id: 'RISK-001',
    title: 'Privileged accounts lack phishing-resistant MFA',
    description:
      'Administrator accounts can still use a password-only fallback during authentication.',
    category: 'Access control',
    likelihood: 4,
    impact: 5,
    status: 'Open',
    owner: 'Identity and access team',
    targetDate: '2026-09-15',
    updatedAt: '2026-08-14',
  },
  {
    id: 'RISK-002',
    title: 'Third-party processor retains sensitive exports',
    description:
      'Exported customer data remains available beyond the approved retention period.',
    category: 'Third-party risk',
    likelihood: 3,
    impact: 5,
    status: 'In treatment',
    owner: 'Vendor management',
    targetDate: '2026-09-30',
    updatedAt: '2026-08-12',
  },
  {
    id: 'RISK-003',
    title: 'Legacy endpoints no longer receive security updates',
    description:
      'Several operational workstations run unsupported operating-system versions.',
    category: 'Security operations',
    likelihood: 4,
    impact: 3,
    status: 'Open',
    owner: 'Infrastructure team',
    targetDate: '2026-10-10',
    updatedAt: '2026-08-11',
  },
  {
    id: 'RISK-004',
    title: 'Incident response contact tree is outdated',
    description:
      'Escalation details do not reflect recent staffing and supplier changes.',
    category: 'Business continuity',
    likelihood: 3,
    impact: 3,
    status: 'Open',
    owner: 'Security operations',
    targetDate: '2026-08-31',
    updatedAt: '2026-08-09',
  },
  {
    id: 'RISK-005',
    title: 'Backup recovery evidence is incomplete',
    description:
      'Recovery tests succeeded, but evidence was not retained consistently.',
    category: 'Data protection',
    likelihood: 2,
    impact: 4,
    status: 'Mitigated',
    owner: 'Platform engineering',
    targetDate: '2026-08-05',
    updatedAt: '2026-08-15',
  },
]