import type { HospedeResponsavel } from '@/lib/api-contracts'

type HospedeViewProps = {
  hospede: HospedeResponsavel
}

export function HospedeView({ hospede }: HospedeViewProps) {
  return (
    <div className="detail-grid">
      <DetailItem label="Nome completo" value={hospede.nomeCompleto} />
      <DetailItem label="CPF" value={formatCpf(hospede.cpf)} />
      <DetailItem label="Email" value={hospede.email} />
      <DetailItem label="Telefone" value={hospede.telefone} />
      <DetailItem label="Documento" value={hospede.documento} />
      <DetailItem label="Empresa" value={hospede.empresa || 'Nao informada'} />
      <DetailItem label="Status" value={hospede.ativo ? 'Ativo' : 'Inativo'} />
      <DetailItem label="Endereco" value={hospede.endereco} />

      <article className="detail-item">
        <span>Acompanhantes</span>
        {hospede.acompanhantes.length === 0 ? (
          <strong>Nenhum acompanhante vinculado.</strong>
        ) : (
          <div className="detail-stack">
            {hospede.acompanhantes.map((acompanhante) => (
              <div className="detail-chip" key={acompanhante.id}>
                <strong>{acompanhante.nomeCompleto}</strong>
                <small>
                  {acompanhante.menorDeIdade ? 'Menor de idade' : 'Maior de idade'}
                  {' · '}
                  {acompanhante.documento || 'Sem documento informado'}
                </small>
              </div>
            ))}
          </div>
        )}
      </article>
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

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.length !== 11) {
    return value
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
