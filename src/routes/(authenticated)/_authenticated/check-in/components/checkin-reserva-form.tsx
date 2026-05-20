import type { CheckInDoDiaItem } from '@/lib/api-contracts'
import {
  formaPagamentoOptions,
  type CheckInReservaFormState,
} from '@/routes/(authenticated)/_authenticated/check-in/schemas/checkin.schemas'

type CheckInReservaFormProps = {
  formError: string | null
  formState: CheckInReservaFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: CheckInReservaFormState) => void
  onSubmit: () => void
  reserva: CheckInDoDiaItem
  requiresProof: boolean
  totalEsperado: string
}

export function CheckInReservaForm({
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
  reserva,
  requiresProof,
  totalEsperado,
}: CheckInReservaFormProps) {
  function updateField<Key extends keyof CheckInReservaFormState>(
    field: Key,
    value: CheckInReservaFormState[Key],
  ) {
    onChange({
      ...formState,
      [field]: value,
    })
  }

  return (
    <div className="form-grid">
      <div className="detail-grid">
        <DetailItem label="Reserva" value={`#${reserva.id}`} />
        <DetailItem label="Grupo" value={reserva.grupoCheckIn} />
        <DetailItem label="Flat" value={reserva.flat.numero} />
        <DetailItem label="Hospede responsavel" value={reserva.hospedeResponsavel.nomeCompleto} />
        <DetailItem label="Periodo reservado" value={`${formatDate(reserva.dataInicio)} - ${formatDate(reserva.dataFim)}`} />
        <DetailItem label="Total contratado" value={formatCurrency(reserva.valorTotalContratado)} />
      </div>

      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Check-in efetivo</span>
          <input
            onChange={(event) => updateField('dataInicioEfetiva', event.target.value)}
            type="datetime-local"
            value={formState.dataInicioEfetiva}
          />
        </label>

        <label className="field">
          <span>Data fim prevista</span>
          <input
            onChange={(event) => updateField('dataFimPrevista', event.target.value)}
            type="date"
            value={formState.dataFimPrevista}
          />
        </label>
      </div>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Pagamento inicial</strong>
            <p className="muted-copy">
              O backend exige quitacao integral da primeira mensalidade no momento do check-in.
            </p>
          </div>
        </div>

        <div className="detail-grid">
          <DetailItem label="Valor esperado" value={formatCurrency(Number(totalEsperado))} />
          <DetailItem label="Hospedes vinculados" value={`${reserva.quantidadeHospedes} pessoa(s)`} />
        </div>

        <div className="form-grid form-grid-two-columns">
          <label className="field">
            <span>Forma de pagamento</span>
            <select
              onChange={(event) => updateField('formaPagamento', event.target.value as CheckInReservaFormState['formaPagamento'])}
              value={formState.formaPagamento}
            >
              <option value="">Selecione</option>
              {formaPagamentoOptions.map((formaPagamento) => (
                <option key={formaPagamento} value={formaPagamento}>
                  {formaPagamento}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Valor pago</span>
            <input
              inputMode="decimal"
              onChange={(event) => updateField('valorPago', event.target.value)}
              placeholder="0.00"
              value={formState.valorPago}
            />
          </label>
        </div>

        <label className="field">
          <span>{requiresProof ? 'Comprovante obrigatorio' : 'Comprovante textual'}</span>
          <textarea
            onChange={(event) => updateField('comprovante', event.target.value)}
            placeholder="Descreva o comprovante ou referencia do pagamento."
            rows={3}
            value={formState.comprovante}
          />
        </label>
      </section>

      <label className="field">
        <span>Observacoes operacionais</span>
        <textarea
          onChange={(event) => updateField('observacoes', event.target.value)}
          placeholder="Observacoes opcionais para a estadia."
          rows={4}
          value={formState.observacoes}
        />
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
          {isPending ? 'Concluindo...' : 'Concluir check-in'}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value))
}
