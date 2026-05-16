import type {
  CategoriaListItem,
  FlatOperationalStatus,
  SubcategoriaListItem,
} from '@/lib/api-contracts'
import {
  flatOperationalStatuses,
  type FlatFormState,
} from '@/routes/(authenticated)/_authenticated/flats/schemas/flats.schemas'

type FlatFormProps = {
  categorias: CategoriaListItem[]
  formError: string | null
  formState: FlatFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: FlatFormState) => void
  onSubmit: () => void
  subcategorias: SubcategoriaListItem[]
}

export function FlatForm({
  categorias,
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
  subcategorias,
}: FlatFormProps) {
  return (
    <div className="form-grid">
      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Numero do flat</span>
          <input
            onChange={(event) => onChange({ ...formState, numero: event.target.value })}
            placeholder="101, A-12, Cobertura 3"
            value={formState.numero}
          />
        </label>

        <label className="field">
          <span>Status operacional</span>
          <select
            onChange={(event) =>
              onChange({
                ...formState,
                statusOperacional: event.target.value as FlatOperationalStatus,
              })
            }
            value={formState.statusOperacional}
          >
            {flatOperationalStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Categoria</span>
          <select
            onChange={(event) => onChange({ ...formState, categoriaId: event.target.value })}
            value={formState.categoriaId}
          >
            <option value="">Selecione</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Subcategoria</span>
          <select
            onChange={(event) => onChange({ ...formState, subcategoriaId: event.target.value })}
            value={formState.subcategoriaId}
          >
            <option value="">Selecione</option>
            {subcategorias.map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Descricao interna</span>
        <textarea
          onChange={(event) => onChange({ ...formState, descricao: event.target.value })}
          placeholder="Observacoes operacionais do flat."
          rows={4}
          value={formState.descricao}
        />
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
          {isPending ? 'Salvando...' : 'Salvar flat'}
        </button>

        <button className="ghost-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </div>
  )
}
