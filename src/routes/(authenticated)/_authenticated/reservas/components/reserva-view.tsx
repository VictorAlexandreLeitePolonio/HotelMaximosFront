import type { Reserva } from '@/lib/api-contracts'

type ReservaViewProps = {
  reserva: Reserva
}

export function ReservaView({ reserva }: ReservaViewProps) {
  return (
    <div className="form-grid">
      <div className="detail-grid">
        <DetailItem label="Reserva" value={`#${reserva.id}`} />
        <DetailItem label="Flat" value={reserva.flat.numero} />
        <DetailItem label="Subcategoria" value={reserva.subcategoria.nome} />
        <DetailItem label="Status" value={reserva.status} />
        <DetailItem label="Periodo" value={`${formatDate(reserva.dataInicio)} - ${formatDate(reserva.dataFim)}`} />
        <DetailItem label="Hospedes" value={`${reserva.quantidadeHospedes} pessoa(s)`} />
        <DetailItem label="Cafe contratado" value={reserva.cafeContratado ? 'Sim' : 'Nao'} />
        <DetailItem label="Valor total" value={formatCurrency(reserva.valorTotalContratado)} />
      </div>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Hospedagem vinculada</strong>
            <p className="muted-copy">
              O backend devolve o snapshot completo da reserva, incluindo responsavel,
              acompanhantes e valores contratados no momento da criacao.
            </p>
          </div>
        </div>

        <div className="detail-grid">
          <DetailItem label="Responsavel" value={reserva.hospedeResponsavel.nomeCompleto} />
          <DetailItem label="CPF" value={formatCpf(reserva.hospedeResponsavel.cpf)} />
          <DetailItem label="Valor base" value={formatCurrency(reserva.valorBaseContratado)} />
          <DetailItem label="Valor cafe por pessoa" value={formatCurrency(reserva.valorCafePorPessoa)} />
          <DetailItem label="Valor total do cafe" value={formatCurrency(reserva.valorCafeContratado)} />
          <DetailItem label="Observacoes" value={reserva.observacoes || 'Nao informadas'} />
        </div>

        <div className="detail-stack">
          {reserva.acompanhantes.length === 0 ? (
            <strong>Nenhum acompanhante vinculado.</strong>
          ) : (
            reserva.acompanhantes.map((acompanhante) => (
              <div className="detail-chip" key={acompanhante.id}>
                <strong>{acompanhante.nomeCompleto}</strong>
                <small>{acompanhante.menorDeIdade ? 'Menor de idade' : 'Maior de idade'}</small>
                <small>{acompanhante.documento || 'Sem documento informado'}</small>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value))
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
