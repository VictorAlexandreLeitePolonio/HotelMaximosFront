import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { z } from 'zod'
import { AppShell } from '@/components/app-shell'
import { PasswordInput } from '@/components/password-input'
import { ApiError } from '@/lib/api-core'
import { changePassword } from '@/lib/http'
import { useAuthStore } from '@/stores/auth-store'

const passwordSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe a senha atual.'),
    novaSenha: z
      .string()
      .min(8, 'A nova senha deve ter ao menos 8 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((value) => value.novaSenha === value.confirmarSenha, {
    message: 'A confirmacao deve ser igual a nova senha.',
    path: ['confirmarSenha'],
  })

export const Route = createFileRoute('/(authenticated)/_authenticated/perfil')({
  component: ProfilePage,
})

function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = passwordSchema.safeParse({
        senhaAtual,
        novaSenha,
        confirmarSenha,
      })

      if (!parsed.success) {
        throw new ApiError(parsed.error.issues[0]?.message || 'Dados invalidos.', 400)
      }

      await changePassword({
        senhaAtual: parsed.data.senhaAtual,
        novaSenha: parsed.data.novaSenha,
      })
    },
    onSuccess: async () => {
      updateUser((currentUser) => ({
        ...currentUser,
        deveAlterarSenha: false,
      }))
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setFormError(null)
      setSuccessMessage('Senha alterada com sucesso.')
      await navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      setSuccessMessage(null)
      setFormError(error instanceof ApiError ? error.message : 'Nao foi possivel alterar a senha.')
    },
  })

  return (
    <AppShell
      title="Meu perfil"
      description="Tela liberada mesmo quando `deveAlterarSenha` estiver ativa, conforme a regra validada no backend."
    >
      <section className="content-grid">
        <article className="info-card">
          <span className="page-kicker">Usuario</span>
          <strong>{user?.nomeCompleto}</strong>
          <p>Login: {user?.login}</p>
          <p>Perfil: {user?.perfil}</p>
          <p>Status: {user?.ativo ? 'Ativo' : 'Inativo'}</p>
        </article>

        <article className="info-card">
          <span className="page-kicker">Troca de senha</span>
          <h2>{user?.deveAlterarSenha ? 'Troca obrigatoria' : 'Atualizar credenciais'}</h2>
          <p>
            O backend zera `deveAlterarSenha` quando a senha muda. O frontend
            atualiza a sessao local sem depender de um endpoint `/me`.
          </p>

          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault()
              setFormError(null)
              setSuccessMessage(null)
              mutation.mutate()
            }}
          >
            <label className="field">
              <span>Senha atual</span>
              <PasswordInput
                autoComplete="current-password"
                onChange={setSenhaAtual}
                value={senhaAtual}
              />
            </label>

            <label className="field">
              <span>Nova senha</span>
              <PasswordInput
                autoComplete="new-password"
                onChange={setNovaSenha}
                value={novaSenha}
              />
            </label>

            <label className="field">
              <span>Confirmar nova senha</span>
              <PasswordInput
                autoComplete="new-password"
                onChange={setConfirmarSenha}
                value={confirmarSenha}
              />
            </label>

            {formError ? <p className="form-error">{formError}</p> : null}
            {successMessage ? <p className="form-success">{successMessage}</p> : null}

            <button className="primary-button" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? 'Salvando...' : 'Alterar senha'}
            </button>
          </form>
        </article>
      </section>
    </AppShell>
  )
}
