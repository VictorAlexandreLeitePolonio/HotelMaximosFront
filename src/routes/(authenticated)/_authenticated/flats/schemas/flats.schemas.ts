import { z } from 'zod'
import type {
  CreateFlatInput,
  Flat,
  FlatsQuery,
  FlatOperationalStatus,
  UpdateFlatInput,
} from '@/lib/api-contracts'

const positiveIdSchema = z
  .string()
  .trim()
  .min(1, 'Selecione uma opcao.')
  .refine(
    (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    'Selecione uma opcao valida.',
  )

export const flatFormSchema = z.object({
  numero: z.string().trim().min(1, 'Informe o numero do flat.'),
  descricao: z.string().optional(),
  categoriaId: positiveIdSchema,
  subcategoriaId: positiveIdSchema,
  statusOperacional: z.enum([
    'Livre',
    'Reservado',
    'Ocupado',
    'AguardandoLimpeza',
    'Manutencao',
  ]),
})

export type DrawerMode = 'create' | 'view' | 'edit'

export type FlatFormState = {
  numero: string
  descricao: string
  categoriaId: string
  subcategoriaId: string
  statusOperacional: FlatOperationalStatus
}

export const defaultFlatsFilters: FlatsQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'criadoEm',
  sortOrder: 'desc',
}

export const defaultFlatFormState: FlatFormState = {
  numero: '',
  descricao: '',
  categoriaId: '',
  subcategoriaId: '',
  statusOperacional: 'Livre',
}

export const flatOperationalStatuses: FlatOperationalStatus[] = [
  'Livre',
  'Reservado',
  'Ocupado',
  'AguardandoLimpeza',
  'Manutencao',
]

export function mapFlatToFormState(flat: Flat): FlatFormState {
  return {
    numero: flat.numero,
    descricao: flat.descricao || '',
    categoriaId: String(flat.categoriaId),
    subcategoriaId: String(flat.subcategoriaId),
    statusOperacional: flat.statusOperacional,
  }
}

export function normalizeFlatCreatePayload(
  data: z.infer<typeof flatFormSchema>,
): CreateFlatInput {
  return {
    numero: data.numero.trim(),
    descricao: data.descricao?.trim() || undefined,
    categoriaId: Number(data.categoriaId),
    subcategoriaId: Number(data.subcategoriaId),
    statusOperacional: data.statusOperacional,
  }
}

export function normalizeFlatUpdatePayload(
  data: z.infer<typeof flatFormSchema>,
): UpdateFlatInput {
  return normalizeFlatCreatePayload(data)
}
