import type { HospedeFormState } from '@/routes/(authenticated)/_authenticated/hospedes/schemas/hospedes.schemas'
import { HospedeFormFields } from '@/routes/(authenticated)/_authenticated/hospedes/components/hospede-form-fields'

type HospedeEditFormProps = {
  formError: string | null
  formState: HospedeFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: HospedeFormState) => void
  onSubmit: () => void
}

export function HospedeEditForm({
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
}: HospedeEditFormProps) {
  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <HospedeFormFields formState={formState} onChange={onChange} />

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} type="submit">
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>

        <button className="ghost-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </form>
  )
}
