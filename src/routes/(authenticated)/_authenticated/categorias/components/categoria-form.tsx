import type { CategoriaFormState } from '@/routes/(authenticated)/_authenticated/categorias/schemas/categorias.schemas'

type CategoriaFormProps = {
  formError: string | null
  formState: CategoriaFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: CategoriaFormState) => void
  onSubmit: () => void
}

export function CategoriaForm({
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
}: CategoriaFormProps) {
  return (
    <div className="form-grid">
      <label className="field">
        <span>Nome</span>
        <input
          onChange={(event) => onChange({ ...formState, nome: event.target.value })}
          placeholder="Executivo, Premium, Familia"
          value={formState.nome}
        />
      </label>

      <label className="field">
        <span>Descricao</span>
        <textarea
          onChange={(event) => onChange({ ...formState, descricao: event.target.value })}
          placeholder="Resumo operacional da categoria."
          rows={4}
          value={formState.descricao}
        />
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <div className="drawer-actions">
        <button className="primary-button" disabled={isPending} onClick={onSubmit} type="button">
          {isPending ? 'Salvando...' : 'Salvar categoria'}
        </button>

        <button className="ghost-button" onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </div>
  )
}
