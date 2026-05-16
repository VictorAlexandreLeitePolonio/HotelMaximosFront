import type { CategoriaListItem } from '@/lib/api-contracts'
import type { SubcategoriaFormState } from '@/routes/(authenticated)/_authenticated/categorias/schemas/categorias.schemas'

type SubcategoriaFormProps = {
  categorias: CategoriaListItem[]
  formError: string | null
  formState: SubcategoriaFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: SubcategoriaFormState) => void
  onSubmit: () => void
}

export function SubcategoriaForm({
  categorias,
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
}: SubcategoriaFormProps) {
  return (
    <div className="form-grid">
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
          <span>Nome</span>
          <input
            onChange={(event) => onChange({ ...formState, nome: event.target.value })}
            placeholder="Apartamento deluxe, Loft casal"
            value={formState.nome}
          />
        </label>
      </div>

      <label className="field">
        <span>Descricao</span>
        <textarea
          onChange={(event) => onChange({ ...formState, descricao: event.target.value })}
          placeholder="Diferencial comercial e operacional da subcategoria."
          rows={4}
          value={formState.descricao}
        />
      </label>

      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Preco base mensal</span>
          <input
            onChange={(event) => onChange({ ...formState, precoBase: event.target.value })}
            placeholder="1.250,00"
            value={formState.precoBase}
          />
        </label>

        <label className="field">
          <span>Capacidade maxima</span>
          <input
            inputMode="numeric"
            onChange={(event) => onChange({ ...formState, capacidadeMaxima: event.target.value })}
            placeholder="2"
            value={formState.capacidadeMaxima}
          />
        </label>
      </div>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
          {isPending ? 'Salvando...' : 'Salvar subcategoria'}
        </button>

        <button className="ghost-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </div>
  )
}
