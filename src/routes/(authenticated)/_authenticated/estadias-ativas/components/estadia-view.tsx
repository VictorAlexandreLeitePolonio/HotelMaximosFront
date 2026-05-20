import type { Estadia } from '@/lib/api-contracts'

type EstadiaViewProps = {
  estadia: Estadia
}

export function EstadiaView({ estadia }: EstadiaViewProps) {
  return (
    <div className="form-grid">
      <div className="detail-grid">
        <DetailItem label="Estadia" value={`#${estadia.id}`} />
        <DetailItem label="Reserva vinculada" value={estadia.reservaId ? `#${estadia.reservaId}` : 'Check-in direto'} />
        <DetailItem label="Flat atual" value={estadia.flat.numero} />
        <DetailItem label="Subcategoria" value={estadia.subcategoria.nome} />
        <DetailItem label="Status" value={estadia.status} />
        <DetailItem label="Periodo ativo" value={`${formatDate(estadia.dataInicio)} - ${formatDate(estadia.dataFimPrevista)}`} />
        <DetailItem label="Hospedes" value={`${estadia.quantidadeHospedes} pessoa(s)`} />
        <DetailItem label="Valor total" value={formatCurrency(estadia.valorTotalContratado)} />
      </div>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Snapshot operacional da ocupacao</strong>
            <p className="muted-copy">
              A tela usa o proprio payload de <code>/api/estadias/ativas</code>, sem depender de
              endpoint de detalhe separado nesta sprint.
            </p>
          </div>
        </div>

        <div className="detail-grid">
          <DetailItem label="Responsavel" value={estadia.hospedeResponsavel.nomeCompleto} />
          <DetailItem label="CPF" value={formatCpf(estadia.hospedeResponsavel.cpf)} />
          <DetailItem label="Cafe contratado" value={estadia.cafeContratado ? 'Sim' : 'Nao'} />
          <DetailItem label="Valor base" value={formatCurrency(estadia.valorBaseContratado)} />
          <DetailItem
            label="Valor cafe por pessoa"
            value={formatCurrency(estadia.valorCafePorPessoa)}
          />
          <DetailItem
            label="Valor total do cafe"
            value={formatCurrency(estadia.valorCafeContratado)}
          />
          <DetailItem label="Observacoes" value={estadia.observacoes || 'Nao informadas'} />
        </div>

        <div className="detail-stack">
          {estadia.acompanhantes.length === 0 ? (
            <strong>Nenhum acompanhante vinculado.</strong>
          ) : (
            estadia.acompanhantes.map((acompanhante) => (
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
