import type {
  CategoriaListItem,
  DisponibilidadeFlat,
  HospedeAcompanhante,
  HospedeListItem,
  SubcategoriaListItem,
} from '@/lib/api-contracts'
import type { ReservaFormState } from '@/routes/(authenticated)/_authenticated/reservas/schemas/reservas.schemas'

type ReservaFormProps = {
  acompanhantesOptions: HospedeAcompanhante[]
  categoriasOptions: CategoriaListItem[]
  disponibilidadeOptions: DisponibilidadeFlat[]
  formError: string | null
  formState: ReservaFormState
  hospedesOptions: HospedeListItem[]
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: ReservaFormState) => void
  onSubmit: () => void
  resumoFinanceiro: {
    quantidadeHospedes: number
    valorBaseContratado: number
    valorCafeContratado: number
    valorTotalContratado: number
  }
  selectedFlat: DisponibilidadeFlat | null
  subcategoriasOptions: SubcategoriaListItem[]
}

export function ReservaForm({
  acompanhantesOptions,
  categoriasOptions,
  disponibilidadeOptions,
  formError,
  formState,
  hospedesOptions,
  isPending,
  onCancel,
  onChange,
  onSubmit,
  resumoFinanceiro,
  selectedFlat,
  subcategoriasOptions,
}: ReservaFormProps) {
  const dataFimPrevistaLabel = formatDatePreview(formState.dataFim)
  const duracaoPrevistaLabel = formatDurationPreview(formState.dataInicio, formState.dataFim)

  function updateField<Key extends keyof ReservaFormState>(field: Key, value: ReservaFormState[Key]) {
    onChange({
      ...formState,
      [field]: value,
    })
  }

  function handleAcompanhanteToggle(acompanhanteId: number, checked: boolean) {
    const nextIds = checked
      ? [...formState.acompanhanteIds, String(acompanhanteId)]
      : formState.acompanhanteIds.filter((value) => value !== String(acompanhanteId))

    updateField('acompanhanteIds', nextIds)
  }

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      {formError ? <p className="form-error">{formError}</p> : null}

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Periodo e filtros operacionais</strong>
            <p className="muted-copy">
              A UI segue o PRD com categoria/subcategoria e data fim prevista no fluxo de
              reserva. No contrato atual do backend, a previsao do periodo ainda e enviada
              como `dataFim`, junto com o `flatId` final escolhido.
            </p>
          </div>
        </div>

        <div className="form-grid form-grid-two-columns">
          <label className="field">
            <span>Data inicial</span>
            <input
              onChange={(event) => updateField('dataInicio', event.target.value)}
              type="date"
              value={formState.dataInicio}
            />
          </label>

          <label className="field">
            <span>Data fim prevista</span>
            <input
              onChange={(event) => updateField('dataFim', event.target.value)}
              type="date"
              value={formState.dataFim}
            />
          </label>

          <label className="field">
            <span>Categoria</span>
            <select
              onChange={(event) => updateField('categoriaId', event.target.value)}
              value={formState.categoriaId}
            >
              <option value="">Todas</option>
              {categoriasOptions.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Subcategoria</span>
            <select
              onChange={(event) => updateField('subcategoriaId', event.target.value)}
              value={formState.subcategoriaId}
            >
              <option value="">Todas</option>
              {subcategoriasOptions.map((subcategoria) => (
                <option key={subcategoria.id} value={subcategoria.id}>
                  {subcategoria.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Hospede responsavel</span>
            <select
              onChange={(event) => updateField('hospedeResponsavelId', event.target.value)}
              value={formState.hospedeResponsavelId}
            >
              <option value="">Selecione</option>
              {hospedesOptions.map((hospede) => (
                <option key={hospede.id} value={hospede.id}>
                  {hospede.nomeCompleto} ({formatCpf(hospede.cpf)})
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
                  Flat {flat.numero} - {flat.subcategoria.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedFlat ? (
          <div className="detail-grid">
            <div className="detail-item">
              <span>Flat selecionado</span>
              <strong>Flat {selectedFlat.numero}</strong>
            </div>
            <div className="detail-item">
              <span>Subcategoria</span>
              <strong>{selectedFlat.subcategoria.nome}</strong>
            </div>
            <div className="detail-item">
              <span>Capacidade maxima</span>
              <strong>{selectedFlat.subcategoria.capacidadeMaxima} hospedes</strong>
            </div>
            <div className="detail-item">
              <span>Status no periodo</span>
              <strong>{selectedFlat.statusDisponibilidade}</strong>
            </div>
          </div>
        ) : (
          <p className="helper-copy">
            Defina o periodo, os filtros e o hospede responsavel para listar os flats
            realmente disponiveis para reserva.
          </p>
        )}
      </section>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Acompanhantes</strong>
            <p className="muted-copy">
              Apenas acompanhantes do hospede responsavel selecionado podem ser vinculados a
              esta reserva.
            </p>
          </div>
        </div>

        {formState.hospedeResponsavelId ? (
          acompanhantesOptions.length === 0 ? (
            <p className="helper-copy">Esse hospede nao possui acompanhantes cadastrados.</p>
          ) : (
            <div className="acompanhantes-stack">
              {acompanhantesOptions.map((acompanhante) => (
                <label className="field-checkbox" key={acompanhante.id}>
                  <input
                    checked={formState.acompanhanteIds.includes(String(acompanhante.id))}
                    onChange={(event) =>
                      handleAcompanhanteToggle(acompanhante.id, event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>{acompanhante.nomeCompleto}</span>
                  <small className="helper-copy">
                    {acompanhante.menorDeIdade ? 'Menor de idade' : acompanhante.documento || 'Sem documento informado'}
                  </small>
                </label>
              ))}
            </div>
          )
        ) : (
          <p className="helper-copy">
            Selecione primeiro o hospede responsavel para liberar a lista de acompanhantes.
          </p>
        )}
      </section>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Valores contratados</strong>
            <p className="muted-copy">
              O resumo abaixo acompanha o snapshot que o backend vai gravar no momento da
              criacao da reserva.
            </p>
          </div>
        </div>

        <label className="field-checkbox">
          <input
            checked={formState.cafeContratado}
            onChange={(event) => updateField('cafeContratado', event.target.checked)}
            type="checkbox"
          />
          <span>Cafe contratado para todos os hospedes</span>
        </label>

        <div className="form-grid form-grid-two-columns">
          <label className="field">
            <span>Valor do cafe por pessoa</span>
            <input
              disabled={!formState.cafeContratado}
              onChange={(event) => updateField('valorCafePorPessoa', event.target.value)}
              step="0.01"
              type="number"
              value={formState.valorCafePorPessoa}
            />
          </label>

          <label className="field">
            <span>Observacoes</span>
            <textarea
              onChange={(event) => updateField('observacoes', event.target.value)}
              rows={3}
              value={formState.observacoes}
            />
          </label>
        </div>

        <div className="summary-grid">
          <div className="detail-item">
            <span>Data fim prevista</span>
            <strong>{dataFimPrevistaLabel}</strong>
          </div>
          <div className="detail-item">
            <span>Duracao prevista</span>
            <strong>{duracaoPrevistaLabel}</strong>
          </div>
          <div className="detail-item">
            <span>Quantidade de hospedes</span>
            <strong>{resumoFinanceiro.quantidadeHospedes}</strong>
          </div>
          <div className="detail-item">
            <span>Valor base contratado</span>
            <strong>{formatCurrency(resumoFinanceiro.valorBaseContratado)}</strong>
          </div>
          <div className="detail-item">
            <span>Valor total do cafe</span>
            <strong>{formatCurrency(resumoFinanceiro.valorCafeContratado)}</strong>
          </div>
          <div className="detail-item">
            <span>Total contratado</span>
            <strong>{formatCurrency(resumoFinanceiro.valorTotalContratado)}</strong>
          </div>
        </div>
      </section>

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} type="submit">
          {isPending ? 'Salvando...' : 'Criar reserva'}
        </button>
        <button className="ghost-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDatePreview(value: string) {
  if (!value) {
    return '-'
  }

  const parsed = new Date(`${value}T12:00:00.000Z`)

  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(parsed)
}

function formatDurationPreview(dataInicio: string, dataFim: string) {
  if (!dataInicio || !dataFim) {
    return '-'
  }

  const start = new Date(`${dataInicio}T12:00:00.000Z`)
  const end = new Date(`${dataFim}T12:00:00.000Z`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return '-'
  }

  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  return `${days} dia(s) corridos`
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
