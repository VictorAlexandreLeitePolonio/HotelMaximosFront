export type UserProfile = 'Admin' | 'Recepcionista'

export type SafeAuthUser = {
  id: number
  login: string
  nomeCompleto: string
  email: string | null
  perfil: UserProfile
  ativo: boolean
  deveAlterarSenha: boolean
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: SafeAuthUser
}

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    traceId?: string
    details?: unknown
  }
}

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type UserListItem = SafeAuthUser & {
  criadoEm: string
  atualizadoEm: string
}

export type UsersQuery = {
  page: number
  pageSize: number
  search?: string
  perfil?: UserProfile
  ativo?: boolean
  sortField?:
    | 'login'
    | 'nomeCompleto'
    | 'email'
    | 'perfil'
    | 'ativo'
    | 'criadoEm'
    | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CreateUserInput = {
  login: string
  nomeCompleto: string
  email?: string | null
  perfil: UserProfile
  senha?: string | null
}

export type UpdateUserInput = Partial<CreateUserInput>

export type HospedeAcompanhante = {
  id: number
  nomeCompleto: string
  documento: string | null
  menorDeIdade: boolean
  criadoEm: string
  atualizadoEm: string
}

export type HospedeResponsavel = {
  id: number
  nomeCompleto: string
  cpf: string
  email: string
  endereco: string
  telefone: string
  documento: string
  empresa: string | null
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
  acompanhantes: HospedeAcompanhante[]
}

export type HospedeListItem = Omit<HospedeResponsavel, 'acompanhantes'> & {
  acompanhantesCount: number
}

export type HospedesQuery = {
  page: number
  pageSize: number
  search?: string
  cpf?: string
  ativo?: boolean
  sortField?: 'nomeCompleto' | 'cpf' | 'email' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type AcompanhanteInput = {
  id?: number
  nomeCompleto: string
  documento?: string
  menorDeIdade: boolean
}

export type CreateHospedeInput = {
  nomeCompleto: string
  cpf: string
  email: string
  endereco: string
  telefone: string
  documento: string
  empresa?: string
  acompanhantes?: AcompanhanteInput[]
}

export type UpdateHospedeInput = Partial<CreateHospedeInput>

export type Categoria = {
  id: number
  nome: string
  descricao: string | null
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export type CategoriaListItem = Categoria & {
  subcategoriasCount: number
}

export type CategoriaQuery = {
  page: number
  pageSize: number
  search?: string
  ativo?: boolean
  sortField?: 'nome' | 'ativo' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CreateCategoriaInput = {
  nome: string
  descricao?: string
}

export type UpdateCategoriaInput = Partial<CreateCategoriaInput>

export type Subcategoria = {
  id: number
  categoriaId: number
  categoriaNome: string | null
  nome: string
  descricao: string | null
  precoBase: number
  capacidadeMaxima: number
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export type SubcategoriaListItem = Subcategoria

export type CategoriaDetail = Categoria & {
  subcategorias: SubcategoriaListItem[]
}

export type SubcategoriasQuery = {
  page: number
  pageSize: number
  categoriaId?: number
  search?: string
  ativo?: boolean
  sortField?: 'nome' | 'precoBase' | 'capacidadeMaxima' | 'ativo' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CreateSubcategoriaInput = {
  categoriaId: number
  nome: string
  descricao?: string
  precoBase: number
  capacidadeMaxima: number
}

export type UpdateSubcategoriaInput = Partial<CreateSubcategoriaInput>

export type FlatOperationalStatus =
  | 'Livre'
  | 'Reservado'
  | 'Ocupado'
  | 'AguardandoLimpeza'
  | 'Manutencao'

export type Flat = {
  id: number
  numero: string
  descricao: string | null
  categoriaId: number
  categoriaNome: string
  subcategoriaId: number
  subcategoriaNome: string
  precoBase: number
  capacidadeMaxima: number
  statusOperacional: FlatOperationalStatus
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export type FlatListItem = Flat

export type FlatsQuery = {
  page: number
  pageSize: number
  search?: string
  categoriaId?: number
  subcategoriaId?: number
  statusOperacional?: FlatOperationalStatus
  ativo?: boolean
  sortField?: 'numero' | 'statusOperacional' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CreateFlatInput = {
  numero: string
  descricao?: string
  categoriaId: number
  subcategoriaId: number
  statusOperacional: FlatOperationalStatus
}

export type UpdateFlatInput = Partial<CreateFlatInput>

export type ReservaStatus = 'Confirmada' | 'Cancelada' | 'NoShow'

export type ReservaSubcategoriaSnapshot = {
  id: number
  nome: string
  precoBase: number
  capacidadeMaxima: number
}

export type ReservaFlatSnapshot = {
  id: number
  numero: string
  statusOperacional: FlatOperationalStatus
}

export type ReservaHospedeResponsavelSnapshot = {
  id: number
  nomeCompleto: string
  cpf: string
}

export type ReservaAcompanhanteSnapshot = {
  id: number
  nomeCompleto: string
  documento: string | null
  menorDeIdade: boolean
}

export type Reserva = {
  id: number
  flatId: number
  flat: ReservaFlatSnapshot
  subcategoriaId: number
  subcategoria: ReservaSubcategoriaSnapshot
  hospedeResponsavelId: number
  hospedeResponsavel: ReservaHospedeResponsavelSnapshot
  acompanhantes: ReservaAcompanhanteSnapshot[]
  dataInicio: string
  dataFim: string
  status: ReservaStatus
  quantidadeHospedes: number
  cafeContratado: boolean
  valorBaseContratado: number
  valorCafePorPessoa: number
  valorCafeContratado: number
  valorTotalContratado: number
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
}

export type ReservaListItem = Reserva

export type ReservasQuery = {
  page: number
  pageSize: number
  search?: string
  flatId?: number
  hospedeResponsavelId?: number
  status?: ReservaStatus
  dataInicio?: string
  dataFim?: string
  sortField?: 'dataInicio' | 'dataFim' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CreateReservaInput = {
  flatId: number
  hospedeResponsavelId: number
  acompanhanteIds: number[]
  dataInicio: string
  dataFim: string
  cafeContratado: boolean
  valorCafePorPessoa: number
  observacoes?: string
}

export type DisponibilidadeFlat = {
  id: number
  numero: string
  subcategoriaId: number
  subcategoria: ReservaSubcategoriaSnapshot
  statusOperacional: FlatOperationalStatus
  statusDisponibilidade: FlatOperationalStatus
  disponivel: boolean
}

export type DisponibilidadeQuery = {
  page: number
  pageSize: number
  dataInicio: string
  dataFim: string
  categoriaId?: number
  subcategoriaId?: number
}

export type FormaPagamento =
  | 'Pix'
  | 'Dinheiro'
  | 'CartaoCredito'
  | 'CartaoDebito'
  | 'Transferencia'

export type EstadiaStatus = 'Ativa' | 'Encerrada'

export type CobrancaStatus = 'Pendente' | 'Paga' | 'Cancelada'

export type Estadia = {
  id: number
  reservaId: number | null
  flatId: number
  flat: ReservaFlatSnapshot
  subcategoriaId: number
  subcategoria: ReservaSubcategoriaSnapshot
  hospedeResponsavelId: number
  hospedeResponsavel: ReservaHospedeResponsavelSnapshot
  acompanhantes: ReservaAcompanhanteSnapshot[]
  dataInicio: string
  dataFimPrevista: string
  dataFimEfetiva: string | null
  status: EstadiaStatus
  quantidadeHospedes: number
  cafeContratado: boolean
  valorBaseContratado: number
  valorCafePorPessoa: number
  valorCafeContratado: number
  valorTotalContratado: number
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
}

export type Cobranca = {
  id: number
  estadiaId: number
  competenciaInicio: string
  competenciaFim: string
  valor: number
  status: CobrancaStatus
  geradaEm: string
  liquidadaEm: string | null
  criadoEm: string
  atualizadoEm: string
}

export type Pagamento = {
  id: number
  cobrancaId: number
  usuarioId: number
  caixaId: number
  formaPagamento: FormaPagamento
  valor: number
  comprovante: string | null
  criadoEm: string
  atualizadoEm: string
}

export type CheckInResult = {
  reserva: Reserva
  estadia: Estadia
  cobranca: Cobranca
  pagamento: Pagamento
}

export type GrupoCheckIn = 'Hoje' | 'Atrasado'

export type CheckInDoDiaItem = Reserva & {
  grupoCheckIn: GrupoCheckIn
}

export type CheckInDoDiaQuery = {
  page: number
  pageSize: number
  grupo?: GrupoCheckIn
  referenceDate?: string
}

export type EstadiasAtivasQuery = {
  page: number
  pageSize: number
  search?: string
  flatId?: number
  hospedeResponsavelId?: number
  sortField?: 'dataInicio' | 'dataFimPrevista' | 'criadoEm' | 'atualizadoEm'
  sortOrder?: 'asc' | 'desc'
}

export type CheckInReservaInput = {
  dataInicioEfetiva?: string
  dataFimPrevista?: string
  formaPagamento: FormaPagamento
  valorPago: number
  comprovante?: string
  observacoes?: string
}

export type CheckInDiretoInput = {
  flatId: number
  hospedeResponsavelId: number
  acompanhanteIds: number[]
  dataInicio?: string
  dataFimPrevista?: string
  cafeContratado: boolean
  valorCafePorPessoa: number
  formaPagamento: FormaPagamento
  valorPago: number
  comprovante?: string
  observacoes?: string
}

export type TransferirFlatInput = {
  novoFlatId: number
  observacoes?: string
}

export type RenovarEstadiaInput = {
  dataFimPrevista: string
  observacoes?: string
}
