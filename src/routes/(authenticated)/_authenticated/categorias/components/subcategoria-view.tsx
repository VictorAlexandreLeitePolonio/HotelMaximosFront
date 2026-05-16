import type { Subcategoria } from '@/lib/api-contracts'

type SubcategoriaViewProps = {
  subcategoria: Subcategoria
}

export function SubcategoriaView({ subcategoria }: SubcategoriaViewProps) {
  return (
    <div className="detail-grid">
      <DetailItem label="Categoria" value={subcategoria.categoriaNome || '-'} />
      <DetailItem label="Nome" value={subcategoria.nome} />
      <DetailItem label="Status" value={subcategoria.ativo ? 'Ativa' : 'Inativa'} />
      <DetailItem label="Preco base" value={formatCurrency(subcategoria.precoBase)} />
      <DetailItem
        label="Capacidade maxima"
        value={`${subcategoria.capacidadeMaxima} hospedes`}
      />
      <DetailItem label="Descricao" value={subcategoria.descricao || 'Nao informada'} />
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
