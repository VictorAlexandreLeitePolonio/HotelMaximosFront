import type { DisponibilidadeFlat } from '@/lib/api-contracts'
import type { TransferFlatFormState } from '@/routes/(authenticated)/_authenticated/estadias-ativas/schemas/estadias.schemas'

type TransferFlatFormProps = {
  availabilityHelperMessage: string | null
  currentFlatLabel: string
  formError: string | null
  formState: TransferFlatFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: TransferFlatFormState) => void
  onSubmit: () => void
  options: DisponibilidadeFlat[]
}

export function TransferFlatForm({
  availabilityHelperMessage,
  currentFlatLabel,
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
  options,
}: TransferFlatFormProps) {
  function updateField<Key extends keyof TransferFlatFormState>(
    field: Key,
    value: TransferFlatFormState[Key],
  ) {
    onChange({
      ...formState,
      [field]: value,
    })
  }

  return (
    <div className="form-grid">
      <div className="detail-grid">
        <DetailItem label="Flat atual" value={currentFlatLabel} />
        <DetailItem label="Objetivo" value="Mover a ocupacao sem recalcular o valor contratado" />
      </div>

      {availabilityHelperMessage ? <p className="form-error">{availabilityHelperMessage}</p> : null}

      <label className="field">
        <span>Novo flat</span>
        <select
          onChange={(event) => updateField('novoFlatId', event.target.value)}
          value={formState.novoFlatId}
        >
          <option value="">Selecione</option>
          {options.map((flat) => (
            <option key={flat.id} value={flat.id}>
              {flat.numero} · {flat.subcategoria.nome} · {formatCurrency(flat.subcategoria.precoBase)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Observacoes operacionais</span>
        <textarea
          onChange={(event) => updateField('observacoes', event.target.value)}
          placeholder="Motivo da transferencia ou contexto adicional."
          rows={4}
          value={formState.observacoes}
        />
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
          {isPending ? 'Transferindo...' : 'Confirmar troca de flat'}
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
