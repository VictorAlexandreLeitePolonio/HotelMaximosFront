import type { Flat } from '@/lib/api-contracts'

type FlatViewProps = {
  flat: Flat
}

export function FlatView({ flat }: FlatViewProps) {
  return (
    <div className="detail-grid">
      <DetailItem label="Flat" value={flat.numero} />
      <DetailItem label="Status operacional" value={flat.statusOperacional} />
      <DetailItem label="Categoria" value={flat.categoriaNome} />
      <DetailItem label="Subcategoria" value={flat.subcategoriaNome} />
      <DetailItem label="Capacidade maxima" value={`${flat.capacidadeMaxima} hospedes`} />
      <DetailItem label="Preco base" value={formatCurrency(flat.precoBase)} />
      <DetailItem label="Status do cadastro" value={flat.ativo ? 'Ativo' : 'Inativo'} />
      <DetailItem label="Descricao" value={flat.descricao || 'Nao informada'} />
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
