import type { CategoriaDetail } from '@/lib/api-contracts'

type CategoriaViewProps = {
  categoria: CategoriaDetail
}

export function CategoriaView({ categoria }: CategoriaViewProps) {
  return (
    <div className="detail-grid">
      <DetailItem label="Nome" value={categoria.nome} />
      <DetailItem label="Status" value={categoria.ativo ? 'Ativa' : 'Inativa'} />
      <DetailItem label="Descricao" value={categoria.descricao || 'Nao informada'} />

      <section className="form-section">
        <div className="section-heading">
          <div>
            <strong>Subcategorias vinculadas</strong>
            <p className="helper-copy">
              Cada subcategoria define preco base e capacidade maxima para os flats.
            </p>
          </div>
          <span className="selection-chip">{categoria.subcategorias.length} cadastradas</span>
        </div>

        {categoria.subcategorias.length === 0 ? (
          <p className="helper-copy">Nenhuma subcategoria vinculada a esta categoria.</p>
        ) : (
          <div className="detail-stack">
            {categoria.subcategorias.map((subcategoria) => (
              <div className="detail-chip" key={subcategoria.id}>
                <strong>{subcategoria.nome}</strong>
                <small>
                  {formatCurrency(subcategoria.precoBase)} • {subcategoria.capacidadeMaxima} hospedes
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
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
