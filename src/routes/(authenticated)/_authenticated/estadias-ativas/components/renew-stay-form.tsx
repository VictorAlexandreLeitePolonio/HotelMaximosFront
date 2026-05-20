import type { RenewStayFormState } from '@/routes/(authenticated)/_authenticated/estadias-ativas/schemas/estadias.schemas'

type RenewStayFormProps = {
  currentEndDateLabel: string
  formError: string | null
  formState: RenewStayFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: RenewStayFormState) => void
  onSubmit: () => void
}

export function RenewStayForm({
  currentEndDateLabel,
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
}: RenewStayFormProps) {
  function updateField<Key extends keyof RenewStayFormState>(
    field: Key,
    value: RenewStayFormState[Key],
  ) {
    onChange({
      ...formState,
      [field]: value,
    })
  }

  return (
    <div className="form-grid">
      <div className="detail-grid">
        <DetailItem label="Fim atual da estadia" value={currentEndDateLabel} />
        <DetailItem label="Objetivo" value="Prorrogar o periodo mantendo historico da renovacao" />
      </div>

      <label className="field">
        <span>Nova data fim prevista</span>
        <input
          onChange={(event) => updateField('dataFimPrevista', event.target.value)}
          type="date"
          value={formState.dataFimPrevista}
        />
      </label>

      <label className="field">
        <span>Observacoes operacionais</span>
        <textarea
          onChange={(event) => updateField('observacoes', event.target.value)}
          placeholder="Motivo da renovacao ou contexto adicional."
          rows={4}
          value={formState.observacoes}
        />
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
          {isPending ? 'Renovando...' : 'Confirmar renovacao'}
        </button>

        <button className="ghost-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
