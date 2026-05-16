import { z } from 'zod'
import type {
  Categoria,
  CategoriaQuery,
  CreateCategoriaInput,
  CreateSubcategoriaInput,
  Subcategoria,
  SubcategoriasQuery,
  UpdateCategoriaInput,
  UpdateSubcategoriaInput,
} from '@/lib/api-contracts'

const positiveIdSchema = z
  .string()
  .trim()
  .min(1, 'Selecione uma categoria.')
  .refine(
    (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    'Selecione uma categoria valida.',
  )

const currencySchema = z
  .string()
  .trim()
  .min(1, 'Informe o preco base.')
  .refine((value) => parseDecimal(value) >= 0, 'Informe um preco base valido.')

const capacitySchema = z
  .string()
  .trim()
  .min(1, 'Informe a capacidade maxima.')
  .refine(
    (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    'Informe uma capacidade maxima valida.',
  )

export const categoriaFormSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da categoria.'),
  descricao: z.string().optional(),
})

export const subcategoriaFormSchema = z.object({
  categoriaId: positiveIdSchema,
  nome: z.string().trim().min(1, 'Informe o nome da subcategoria.'),
  descricao: z.string().optional(),
  precoBase: currencySchema,
  capacidadeMaxima: capacitySchema,
})

export type DrawerMode = 'create' | 'view' | 'edit'

export type CategoriaFormState = {
  nome: string
  descricao: string
}

export type SubcategoriaFormState = {
  categoriaId: string
  nome: string
  descricao: string
  precoBase: string
  capacidadeMaxima: string
}

export const defaultCategoriasFilters: CategoriaQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'criadoEm',
  sortOrder: 'desc',
}

export const defaultSubcategoriasFilters: SubcategoriasQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'criadoEm',
  sortOrder: 'desc',
}

export const defaultCategoriaFormState: CategoriaFormState = {
  nome: '',
  descricao: '',
}

export const defaultSubcategoriaFormState: SubcategoriaFormState = {
  categoriaId: '',
  nome: '',
  descricao: '',
  precoBase: '',
  capacidadeMaxima: '',
}

export function mapCategoriaToFormState(categoria: Categoria): CategoriaFormState {
  return {
    nome: categoria.nome,
    descricao: categoria.descricao || '',
  }
}

export function mapSubcategoriaToFormState(subcategoria: Subcategoria): SubcategoriaFormState {
  return {
    categoriaId: String(subcategoria.categoriaId),
    nome: subcategoria.nome,
    descricao: subcategoria.descricao || '',
    precoBase: formatMoneyInput(subcategoria.precoBase),
    capacidadeMaxima: String(subcategoria.capacidadeMaxima),
  }
}

export function normalizeCategoriaCreatePayload(
  data: z.infer<typeof categoriaFormSchema>,
): CreateCategoriaInput {
  return {
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || undefined,
  }
}

export function normalizeCategoriaUpdatePayload(
  data: z.infer<typeof categoriaFormSchema>,
): UpdateCategoriaInput {
  return normalizeCategoriaCreatePayload(data)
}

export function normalizeSubcategoriaCreatePayload(
  data: z.infer<typeof subcategoriaFormSchema>,
): CreateSubcategoriaInput {
  return {
    categoriaId: Number(data.categoriaId),
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || undefined,
    precoBase: parseDecimal(data.precoBase),
    capacidadeMaxima: Number(data.capacidadeMaxima),
  }
}

export function normalizeSubcategoriaUpdatePayload(
  data: z.infer<typeof subcategoriaFormSchema>,
): UpdateSubcategoriaInput {
  return normalizeSubcategoriaCreatePayload(data)
}

function parseDecimal(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatMoneyInput(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
