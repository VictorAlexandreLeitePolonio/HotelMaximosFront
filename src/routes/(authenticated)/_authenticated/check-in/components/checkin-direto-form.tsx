import type {
  DisponibilidadeFlat,
  HospedeAcompanhante,
  HospedeListItem,
} from '@/lib/api-contracts'
import {
  formaPagamentoOptions,
  type CheckInDiretoFormState,
} from '@/routes/(authenticated)/_authenticated/check-in/schemas/checkin.schemas'

type CheckInDiretoFormProps = {
  acompanhantesOptions: HospedeAcompanhante[]
  availabilityHelperMessage: string | null
  disponibilidadeOptions: DisponibilidadeFlat[]
  formError: string | null
  formState: CheckInDiretoFormState
  hospedesOptions: HospedeListItem[]
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: CheckInDiretoFormState) => void
  onSubmit: () => void
  requiresProof: boolean
  resumoFinanceiro: {
    quantidadeHospedes: number
    valorBaseContratado: number
    valorCafeContratado: number
    valorTotalContratado: number
  }
}

export function CheckInDiretoForm({
  acompanhantesOptions,
  availabilityHelperMessage,
  disponibilidadeOptions,
  formError,
  formState,
  hospedesOptions,
  isPending,
  onCancel,
  onChange,
  onSubmit,
  requiresProof,
  resumoFinanceiro,
}: CheckInDiretoFormProps) {
  function updateField<Key extends keyof CheckInDiretoFormState>(
    field: Key,
    value: CheckInDiretoFormState[Key],
  ) {
    onChange({
      ...formState,
      [field]: value,
    })
  }

  function toggleAcompanhante(acompanhanteId: number, checked: boolean) {
    const nextIds = checked
      ? [...formState.acompanhanteIds, acompanhanteId]
      : formState.acompanhanteIds.filter((id) => id !== acompanhanteId)

    updateField('acompanhanteIds', nextIds)
  }

  return (
    <div className="form-grid">
      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Hospede responsavel</span>
          <select
            onChange={(event) => updateField('hospedeResponsavelId', event.target.value)}
            value={formState.hospedeResponsavelId}
          >
            <option value="">Selecione</option>
            {hospedesOptions.map((hospede) => (
              <option key={hospede.id} value={hospede.id}>
                {hospede.nomeCompleto} · {formatCpf(hospede.cpf)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Flat disponivel</span>
          <select
            onChange={(event) => updateField('flatId', event.target.value)}
            value={formState.flatId}
          >
            <option value="">Selecione</option>
            {disponibilidadeOptions.map((flat) => (
              <option key={flat.id} value={flat.id}>
                {flat.numero} · {flat.subcategoria.nome} · {formatCurrency(flat.subcategoria.precoBase)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Check-in efetivo</span>
          <input
            onChange={(event) => updateField('dataInicio', event.target.value)}
            type="datetime-local"
            value={formState.dataInicio}
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

      {availabilityHelperMessage ? <p className="form-error">{availabilityHelperMessage}</p> : null}

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Acompanhantes vinculados</strong>
            <p className="muted-copy">
              O check-in direto replica a regra do backend e vincula apenas acompanhantes do
              responsavel selecionado.
            </p>
          </div>
        </div>

        {acompanhantesOptions.length === 0 ? (
          <p className="muted-copy">Nenhum acompanhante disponivel para este responsavel.</p>
        ) : (
          <div className="acompanhantes-stack">
            {acompanhantesOptions.map((acompanhante) => (
              <label className="field-checkbox" key={acompanhante.id}>
                <input
                  checked={formState.acompanhanteIds.includes(acompanhante.id)}
                  onChange={(event) => toggleAcompanhante(acompanhante.id, event.target.checked)}
                  type="checkbox"
                />
                <span>
                  {acompanhante.nomeCompleto} ·{' '}
                  {acompanhante.documento || 'Sem documento informado'}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Valores contratados</strong>
            <p className="muted-copy">
              O valor do pagamento inicial precisa bater exatamente com o total contratado da
              estadia criada.
            </p>
          </div>
        </div>

        <label className="field-checkbox">
          <input
            checked={formState.cafeContratado}
            onChange={(event) => updateField('cafeContratado', event.target.checked)}
            type="checkbox"
          />
          <span>Cafe contratado para todos os hospedes vinculados</span>
        </label>

        {formState.cafeContratado ? (
          <label className="field">
            <span>Valor do cafe por pessoa</span>
            <input
              inputMode="decimal"
              onChange={(event) => updateField('valorCafePorPessoa', event.target.value)}
              placeholder="0.00"
              value={formState.valorCafePorPessoa}
            />
          </label>
        ) : null}

        <div className="summary-grid">
          <DetailItem
            label="Hospedes"
            value={`${resumoFinanceiro.quantidadeHospedes} pessoa(s)`}
          />
          <DetailItem
            label="Valor base"
            value={formatCurrency(resumoFinanceiro.valorBaseContratado)}
          />
          <DetailItem
            label="Valor cafe"
            value={formatCurrency(resumoFinanceiro.valorCafeContratado)}
          />
          <DetailItem
            label="Total contratado"
            value={formatCurrency(resumoFinanceiro.valorTotalContratado)}
          />
        </div>
      </section>

      <section className="form-section">
        <div className="form-grid form-grid-two-columns">
          <label className="field">
            <span>Forma de pagamento</span>
            <select
              onChange={(event) =>
                updateField('formaPagamento', event.target.value as CheckInDiretoFormState['formaPagamento'])
              }
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
          {isPending ? 'Concluindo...' : 'Concluir check-in direto'}
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

function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
