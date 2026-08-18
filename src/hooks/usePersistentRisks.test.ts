import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { seedRisks } from '../data/seedRisks'
import {
  riskStorageKey,
  usePersistentRisks,
} from './usePersistentRisks'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('usePersistentRisks', () => {
  it('uses seed data and persists it when storage is empty', async () => {
    const { result } = renderHook(() =>
      usePersistentRisks(seedRisks),
    )

    expect(result.current[0]).toEqual(seedRisks)
    expect(result.current[0]).not.toBe(seedRisks)

    await waitFor(() => {
      expect(localStorage.getItem(riskStorageKey)).toBe(
        JSON.stringify(seedRisks),
      )
    })
  })

  it('restores valid saved risks', () => {
    const savedRisks = [
      {
        ...seedRisks[0],
        status: 'Mitigated' as const,
      },
    ]

    localStorage.setItem(riskStorageKey, JSON.stringify(savedRisks))

    const { result } = renderHook(() =>
      usePersistentRisks(seedRisks),
    )

    expect(result.current[0]).toEqual(savedRisks)
  })

  it('persists immutable status updates', async () => {
    const { result } = renderHook(() =>
      usePersistentRisks(seedRisks),
    )

    act(() => {
      result.current[1]((currentRisks) =>
        currentRisks.map((risk) =>
          risk.id === 'RISK-001'
            ? { ...risk, status: 'Mitigated' }
            : risk,
        ),
      )
    })

    await waitFor(() => {
      const storedRisks = JSON.parse(
        localStorage.getItem(riskStorageKey) ?? '[]',
      )

      expect(storedRisks[0].status).toBe('Mitigated')
    })

    expect(seedRisks[0].status).toBe('Open')
  })

  it('falls back safely when stored JSON is corrupted', () => {
    localStorage.setItem(riskStorageKey, '{not-valid-json')

    const { result } = renderHook(() =>
      usePersistentRisks(seedRisks),
    )

    expect(result.current[0]).toEqual(seedRisks)
  })

  it('rejects stored values that do not match the risk model', () => {
    localStorage.setItem(
      riskStorageKey,
      JSON.stringify([{ id: 'INVALID' }]),
    )

    const { result } = renderHook(() =>
      usePersistentRisks(seedRisks),
    )

    expect(result.current[0]).toEqual(seedRisks)
  })
})