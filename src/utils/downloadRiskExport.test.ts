import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { seedRisks } from '../data/seedRisks'
import { downloadRiskRegister } from './downloadRiskExport'

const exportDate = new Date('2026-08-18T12:34:56.000Z')

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('downloadRiskRegister', () => {
  it('downloads a versioned JSON file and releases its object URL', () => {
    const createObjectURL = vi.fn((blob: Blob) => {
      void blob
      return 'blob:cyber-risk-register'
    })

    const revokeObjectURL = vi.fn(
      (objectUrl: string) => {
        void objectUrl
      },
    )

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })

    const clickedLinks: HTMLAnchorElement[] = []

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        clickedLinks.push(this)
      })

    const filename = downloadRiskRegister(
      seedRisks,
      exportDate,
    )

    expect(filename).toBe(
      'cyber-risk-register-2026-08-18.json',
    )
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledWith(
      expect.any(Blob),
    )
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(clickedLinks).toHaveLength(1)

    const clickedLink = clickedLinks[0]

    expect(clickedLink.download).toBe(filename)
    expect(clickedLink.href).toBe(
      'blob:cyber-risk-register',
    )
    expect(clickedLink.hidden).toBe(true)
    expect(document.body.contains(clickedLink)).toBe(false)

    const exportedBlob =
      createObjectURL.mock.calls[0][0]

    expect(exportedBlob.type).toBe(
      'application/json;charset=utf-8',
    )
    expect(revokeObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:cyber-risk-register',
    )
  })

  it('still cleans up when the browser blocks the click', () => {
    const createObjectURL = vi.fn((blob: Blob) => {
      void blob
      return 'blob:blocked-export'
    })

    const revokeObjectURL = vi.fn(
      (objectUrl: string) => {
        void objectUrl
      },
    )

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })

    vi.spyOn(
      HTMLAnchorElement.prototype,
      'click',
    ).mockImplementation(() => {
      throw new Error('Download blocked')
    })

    expect(() =>
      downloadRiskRegister(seedRisks, exportDate),
    ).toThrow('Download blocked')

    expect(
      document.querySelector('a[download]'),
    ).not.toBeInTheDocument()
    expect(revokeObjectURL).toHaveBeenCalledWith(
      'blob:blocked-export',
    )
  })
})