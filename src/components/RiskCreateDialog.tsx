import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type RefObject,
} from 'react'
import { riskCategories } from '../types/risk'
import {
  type RiskDraft,
  type RiskDraftErrors,
  validateRiskDraft,
} from '../utils/riskDraft'

interface RiskCreateDialogProps {
  onSave: (draft: RiskDraft) => void
  onClose: () => void
  initialDraft?: RiskDraft
  eyebrow?: string
  heading?: string
  description?: string
  submitLabel?: string
  returnFocusFallbackRef?: RefObject<HTMLElement | null>
}

const riskLevels = [1, 2, 3, 4, 5] as const

const emptyRiskDraft: RiskDraft = {
  title: '',
  description: '',
  category: '',
  likelihood: 3,
  impact: 3,
  owner: '',
  targetDate: '',
}

export function RiskCreateDialog({
  onSave,
  onClose,
  initialDraft = emptyRiskDraft,
  eyebrow = 'New record',
  heading = 'Add a risk',
  description = 'Record the risk, its ownership and its treatment target. All fields are required.',
  submitLabel = 'Create risk',
  returnFocusFallbackRef,
}: RiskCreateDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const formId = useId()
  const [draft, setDraft] = useState<RiskDraft>(() => ({
    ...initialDraft,
  }))
  const [errors, setErrors] = useState<RiskDraftErrors>({})

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const fallbackFocusTarget =
      returnFocusFallbackRef?.current ?? null

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    titleInputRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )

      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement =
        focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus()
      } else {
        fallbackFocusTarget?.focus()
      }
    }
  }, [onClose, returnFocusFallbackRef])

  function updateDraft<Field extends keyof RiskDraft>(
    field: Field,
    value: RiskDraft[Field],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))

    if (!errors[field]) return

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateRiskDraft(draft)
    const firstInvalidField = Object.keys(nextErrors)[0] as
      | keyof RiskDraft
      | undefined

    setErrors(nextErrors)

    if (firstInvalidField) {
      formRef.current
        ?.querySelector<HTMLElement>(
          `[name="${firstInvalidField}"]`,
        )
        ?.focus()
      return
    }

    onSave(draft)
  }

  function errorId(field: keyof RiskDraft): string {
    return `${formId}-${field}-error`
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className="risk-dialog risk-create-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className="risk-dialog__header">
          <div>
            <p className="risk-dialog__eyebrow">{eyebrow}</p>
            <h2 id={titleId}>{heading}</h2>
          </div>

          <button
            className="risk-dialog__close"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="risk-dialog__description" id={descriptionId}>
          {description}
        </p>

        <form
          ref={formRef}
          className="risk-create-form"
          noValidate
          onSubmit={handleSubmit}
        >
          {Object.keys(errors).length > 0 ? (
            <p className="risk-create-form__alert" role="alert">
              Review the highlighted fields before saving the risk.
            </p>
          ) : null}

          <div className="risk-create-form__grid">
            <div className="risk-create-form__field risk-create-form__field--wide">
              <label htmlFor={`${formId}-title`}>Risk title</label>
              <input
                ref={titleInputRef}
                id={`${formId}-title`}
                name="title"
                type="text"
                value={draft.title}
                maxLength={120}
                required
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? errorId('title') : undefined
                }
                onChange={(event) =>
                  updateDraft('title', event.target.value)
                }
              />

              {errors.title ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('title')}
                >
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div className="risk-create-form__field risk-create-form__field--wide">
              <label htmlFor={`${formId}-description`}>
                Description
              </label>
              <textarea
                id={`${formId}-description`}
                name="description"
                value={draft.description}
                maxLength={500}
                rows={4}
                required
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? errorId('description')
                    : undefined
                }
                onChange={(event) =>
                  updateDraft('description', event.target.value)
                }
              />

              {errors.description ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('description')}
                >
                  {errors.description}
                </p>
              ) : null}
            </div>

            <div className="risk-create-form__field">
              <label htmlFor={`${formId}-category`}>Category</label>
              <select
                id={`${formId}-category`}
                name="category"
                value={draft.category}
                required
                aria-invalid={Boolean(errors.category)}
                aria-describedby={
                  errors.category ? errorId('category') : undefined
                }
                onChange={(event) =>
                  updateDraft('category', event.target.value)
                }
              >
                <option value="">Choose a category</option>

                {riskCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {errors.category ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('category')}
                >
                  {errors.category}
                </p>
              ) : null}
            </div>

            <div className="risk-create-form__field">
              <label htmlFor={`${formId}-owner`}>Owner</label>
              <input
                id={`${formId}-owner`}
                name="owner"
                type="text"
                value={draft.owner}
                maxLength={80}
                required
                aria-invalid={Boolean(errors.owner)}
                aria-describedby={
                  errors.owner ? errorId('owner') : undefined
                }
                onChange={(event) =>
                  updateDraft('owner', event.target.value)
                }
              />

              {errors.owner ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('owner')}
                >
                  {errors.owner}
                </p>
              ) : null}
            </div>

            <div className="risk-create-form__field">
              <label htmlFor={`${formId}-likelihood`}>
                Likelihood
              </label>
              <select
                id={`${formId}-likelihood`}
                name="likelihood"
                value={draft.likelihood}
                required
                aria-invalid={Boolean(errors.likelihood)}
                aria-describedby={
                  errors.likelihood
                    ? errorId('likelihood')
                    : undefined
                }
                onChange={(event) =>
                  updateDraft(
                    'likelihood',
                    Number(event.target.value),
                  )
                }
              >
                {riskLevels.map((level) => (
                  <option key={level} value={level}>
                    {level} of 5
                  </option>
                ))}
              </select>

              {errors.likelihood ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('likelihood')}
                >
                  {errors.likelihood}
                </p>
              ) : null}
            </div>

            <div className="risk-create-form__field">
              <label htmlFor={`${formId}-impact`}>Impact</label>
              <select
                id={`${formId}-impact`}
                name="impact"
                value={draft.impact}
                required
                aria-invalid={Boolean(errors.impact)}
                aria-describedby={
                  errors.impact ? errorId('impact') : undefined
                }
                onChange={(event) =>
                  updateDraft('impact', Number(event.target.value))
                }
              >
                {riskLevels.map((level) => (
                  <option key={level} value={level}>
                    {level} of 5
                  </option>
                ))}
              </select>

              {errors.impact ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('impact')}
                >
                  {errors.impact}
                </p>
              ) : null}
            </div>

            <div className="risk-create-form__field">
              <label htmlFor={`${formId}-targetDate`}>
                Target date
              </label>
              <input
                id={`${formId}-targetDate`}
                name="targetDate"
                type="date"
                value={draft.targetDate}
                required
                aria-invalid={Boolean(errors.targetDate)}
                aria-describedby={
                  errors.targetDate
                    ? errorId('targetDate')
                    : undefined
                }
                onChange={(event) =>
                  updateDraft('targetDate', event.target.value)
                }
              />

              {errors.targetDate ? (
                <p
                  className="risk-create-form__error"
                  id={errorId('targetDate')}
                >
                  {errors.targetDate}
                </p>
              ) : null}
            </div>
          </div>

          <div className="risk-create-form__actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}