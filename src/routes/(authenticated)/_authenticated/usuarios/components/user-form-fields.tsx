import { PasswordInput } from '@/components/password-input'
import type { UserProfile } from '@/lib/api-contracts'
import type { UserFormState } from '@/routes/(authenticated)/_authenticated/usuarios/schemas/users.schemas'

type UserFormFieldsProps = {
  formState: UserFormState
  onChange: (nextState: UserFormState) => void
  passwordLabel: string
}

export function UserFormFields({
  formState,
  onChange,
  passwordLabel,
}: UserFormFieldsProps) {
  return (
    <>
      <label className="field">
        <span>Login</span>
        <input
          onChange={(event) =>
            onChange({
              ...formState,
              login: event.target.value,
            })
          }
          value={formState.login}
        />
      </label>

      <label className="field">
        <span>Nome completo</span>
        <input
          onChange={(event) =>
            onChange({
              ...formState,
              nomeCompleto: event.target.value,
            })
          }
          value={formState.nomeCompleto}
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          onChange={(event) =>
            onChange({
              ...formState,
              email: event.target.value,
            })
          }
          value={formState.email}
        />
      </label>

      <label className="field">
        <span>Perfil</span>
        <select
          onChange={(event) =>
            onChange({
              ...formState,
              perfil: event.target.value as UserProfile,
            })
          }
          value={formState.perfil}
        >
          <option value="Admin">Admin</option>
          <option value="Recepcionista">Recepcionista</option>
        </select>
      </label>

      <label className="field">
        <span>{passwordLabel}</span>
        <PasswordInput
          onChange={(value) =>
            onChange({
              ...formState,
              senha: value,
            })
          }
          value={formState.senha}
        />
      </label>
    </>
  )
}
