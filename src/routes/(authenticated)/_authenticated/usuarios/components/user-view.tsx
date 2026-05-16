import type { UserListItem } from '@/lib/api-contracts'

type UserViewProps = {
  user: UserListItem
}

export function UserView({ user }: UserViewProps) {
  return (
    <div className="detail-grid">
      <DetailItem label="Login" value={user.login} />
      <DetailItem label="Nome completo" value={user.nomeCompleto} />
      <DetailItem label="Email" value={user.email || 'Nao informado'} />
      <DetailItem label="Perfil" value={user.perfil} />
      <DetailItem label="Status" value={user.ativo ? 'Ativo' : 'Inativo'} />
      <DetailItem
        label="Troca de senha"
        value={user.deveAlterarSenha ? 'Obrigatoria' : 'Ok'}
      />
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
