import type { UserFormState } from '@/routes/(authenticated)/_authenticated/usuarios/schemas/users.schemas'
import { UserFormFields } from '@/routes/(authenticated)/_authenticated/usuarios/components/user-form-fields'

type UserEditFormProps = {
  formError: string | null
  formState: UserFormState
  isPending: boolean
  onCancel: () => void
  onChange: (nextState: UserFormState) => void
  onSubmit: () => void
}

export function UserEditForm({
  formError,
  formState,
  isPending,
  onCancel,
  onChange,
  onSubmit,
}: UserEditFormProps) {
  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <UserFormFields
        formState={formState}
        onChange={onChange}
        passwordLabel="Senha (opcional para redefinir)"
      />

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
