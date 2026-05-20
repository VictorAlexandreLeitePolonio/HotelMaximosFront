import type {
  CategoriaListItem,
  DisponibilidadeFlat,
  FlatOperationalStatus,
  SubcategoriaListItem,
} from '@/lib/api-contracts'
import { isDateRangeValid } from '@/routes/(authenticated)/_authenticated/reservas/schemas/reservas.schemas'

type DisponibilidadeGridProps = {
  applyFilters: () => void
  categoriasOptions: CategoriaListItem[]
  currentPage: number
  data: DisponibilidadeFlat[]
  draftCategoriaId: string
  draftDataFim: string
  draftDataInicio: string
  draftSubcategoriaId: string
  errorMessage: string | null
  isLoading: boolean
  onDraftCategoriaChange: (value: string) => void
  onDraftDataFimChange: (value: string) => void
  onDraftDataInicioChange: (value: string) => void
  onDraftSubcategoriaChange: (value: string) => void
  onFlatClick: (flat: DisponibilidadeFlat) => void
  onNextPage: () => void
  onPreviousPage: () => void
  subcategoriasOptions: SubcategoriaListItem[]
  totalPages: number
}

export function DisponibilidadeGrid({
  applyFilters,
  categoriasOptions,
  currentPage,
  data,
  draftCategoriaId,
  draftDataFim,
  draftDataInicio,
  draftSubcategoriaId,
  errorMessage,
  isLoading,
  onDraftCategoriaChange,
  onDraftDataFimChange,
  onDraftDataInicioChange,
  onDraftSubcategoriaChange,
  onFlatClick,
  onNextPage,
  onPreviousPage,
  subcategoriasOptions,
  totalPages,
}: DisponibilidadeGridProps) {
  const hasValidRange = isDateRangeValid(draftDataInicio, draftDataFim)

  return (
    <section className="table-card">
      <div className="table-card-header">
        <div>
          <strong>Grade de disponibilidade</strong>
          <p>
            Clique em um flat para abrir o painel contextual da sprint 4 e iniciar a reserva
            nos cenarios permitidos pelo backend.
          </p>
        </div>
      </div>

      <section className="page-toolbar">
        <div className="toolbar-filters">
          <label className="field inline-field">
            <span>Data inicial</span>
            <input
              onChange={(event) => onDraftDataInicioChange(event.target.value)}
              type="date"
              value={draftDataInicio}
            />
          </label>

          <label className="field inline-field">
            <span>Data final</span>
            <input
              onChange={(event) => onDraftDataFimChange(event.target.value)}
              type="date"
              value={draftDataFim}
            />
          </label>

          <label className="field inline-field">
            <span>Categoria</span>
            <select
              onChange={(event) => onDraftCategoriaChange(event.target.value)}
              value={draftCategoriaId}
            >
              <option value="">Todas</option>
              {categoriasOptions.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="field inline-field">
            <span>Subcategoria</span>
            <select
              onChange={(event) => onDraftSubcategoriaChange(event.target.value)}
              value={draftSubcategoriaId}
            >
              <option value="">Todas</option>
              {subcategoriasOptions.map((subcategoria) => (
                <option key={subcategoria.id} value={subcategoria.id}>
                  {subcategoria.nome}
                </option>
              ))}
            </select>
          </label>

          <button className="ghost-button" onClick={applyFilters} type="button">
            Atualizar grade
          </button>
        </div>
      </section>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {!hasValidRange ? (
        <p className="helper-copy">
          Defina um intervalo valido para consultar a disponibilidade dos flats.
        </p>
      ) : null}

      <div className="availability-grid">
        {isLoading ? (
          <p>Carregando disponibilidade...</p>
        ) : data.length === 0 ? (
          <p>Nenhum flat encontrado para o intervalo e filtros aplicados.</p>
        ) : (
          data.map((flat) => (
            <button
              className="availability-card"
              key={flat.id}
              onClick={() => onFlatClick(flat)}
              type="button"
            >
              <div className="availability-card-header">
                <div>
                  <span className="page-kicker">Flat {flat.numero}</span>
                  <strong>{flat.subcategoria.nome}</strong>
                </div>

                <span
                  className="status-pill"
                  data-tone={getFlatTone(flat.statusDisponibilidade)}
                >
                  {flat.statusDisponibilidade}
                </span>
              </div>

              <p className="muted-copy">
                Capacidade maxima de {flat.subcategoria.capacidadeMaxima} hospedes. Preco base
                atual de {formatCurrency(flat.subcategoria.precoBase)}.
              </p>

              <div className="availability-card-footer">
                <span className="selection-chip">
                  {flat.disponivel ? 'Disponivel para reservar' : 'Indisponivel no periodo'}
                </span>
                <span className="helper-copy">Abrir painel</span>
              </div>
            </button>
          ))
        )}
      </div>

      <footer className="table-footer">
        <span>
          Pagina {currentPage} de {totalPages}
        </span>

        <div className="table-pagination">
          <button
            className="ghost-button compact-button"
            disabled={currentPage <= 1}
            onClick={onPreviousPage}
            type="button"
          >
            Anterior
          </button>

          <button
            className="ghost-button compact-button"
            disabled={currentPage >= totalPages}
            onClick={onNextPage}
            type="button"
          >
            Proxima
          </button>
        </div>
      </footer>
    </section>
  )
}

function getFlatTone(status: FlatOperationalStatus) {
  switch (status) {
    case 'Livre':
      return 'success'
    case 'Reservado':
      return 'warning'
    case 'Ocupado':
      return 'danger'
    case 'AguardandoLimpeza':
      return 'info'
    case 'Manutencao':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
