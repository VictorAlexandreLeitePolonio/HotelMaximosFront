import { z } from 'zod'
import type {
  CreateHospedeInput,
  HospedeResponsavel,
  HospedesQuery,
  UpdateHospedeInput,
} from '@/lib/api-contracts'

const cpfDigitsSchema = z
  .string()
  .trim()
  .min(1, 'Informe o CPF.')
  .refine((value) => normalizeCpf(value).length === 11, 'Informe um CPF com 11 digitos.')

export const acompanhanteFormSchema = z
  .object({
    id: z.number().optional(),
    nomeCompleto: z.string().trim().min(1, 'Informe o nome completo do acompanhante.'),
    documento: z.string().optional(),
    menorDeIdade: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.menorDeIdade && !value.documento?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documento'],
        message: 'Documento e obrigatorio para acompanhante maior de idade.',
      })
    }
  })

export const hospedeFormSchema = z.object({
  nomeCompleto: z.string().trim().min(1, 'Informe o nome completo do hospede responsavel.'),
  cpf: cpfDigitsSchema,
  email: z.string().trim().email('Informe um email valido.'),
  endereco: z.string().trim().min(1, 'Informe o endereco.'),
  telefone: z.string().trim().min(1, 'Informe o telefone.'),
  documento: z.string().trim().min(1, 'Informe o documento do responsavel.'),
  empresa: z.string().optional(),
  acompanhantes: z.array(acompanhanteFormSchema),
})

export type DrawerMode = 'create' | 'view' | 'edit'

export type AcompanhanteFormState = {
  id?: number
  nomeCompleto: string
  documento: string
  menorDeIdade: boolean
}

export type HospedeFormState = {
  nomeCompleto: string
  cpf: string
  email: string
  endereco: string
  telefone: string
  documento: string
  empresa: string
  acompanhantes: AcompanhanteFormState[]
}

export const defaultHospedesFilters: HospedesQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'criadoEm',
  sortOrder: 'desc',
}

export const defaultHospedeFormState: HospedeFormState = {
  nomeCompleto: '',
  cpf: '',
  email: '',
  endereco: '',
  telefone: '',
  documento: '',
  empresa: '',
  acompanhantes: [],
}

export function createEmptyAcompanhante(): AcompanhanteFormState {
  return {
    nomeCompleto: '',
    documento: '',
    menorDeIdade: false,
  }
}

export function mapHospedeToFormState(hospede: HospedeResponsavel): HospedeFormState {
  return {
    nomeCompleto: hospede.nomeCompleto,
    cpf: hospede.cpf,
    email: hospede.email,
    endereco: hospede.endereco,
    telefone: hospede.telefone,
    documento: hospede.documento,
    empresa: hospede.empresa || '',
    acompanhantes: hospede.acompanhantes.map((acompanhante) => ({
      id: acompanhante.id,
      nomeCompleto: acompanhante.nomeCompleto,
      documento: acompanhante.documento || '',
      menorDeIdade: acompanhante.menorDeIdade,
    })),
  }
}

export function normalizeHospedeCreatePayload(
  data: z.infer<typeof hospedeFormSchema>,
): CreateHospedeInput {
  return {
    nomeCompleto: data.nomeCompleto.trim(),
    cpf: data.cpf.trim(),
    email: data.email.trim(),
    endereco: data.endereco.trim(),
    telefone: data.telefone.trim(),
    documento: data.documento.trim(),
    empresa: data.empresa?.trim() ? data.empresa.trim() : undefined,
    acompanhantes: normalizeAcompanhantes(data.acompanhantes),
  }
}

export function normalizeHospedeUpdatePayload(
  data: z.infer<typeof hospedeFormSchema>,
): UpdateHospedeInput {
  return normalizeHospedeCreatePayload(data)
}

function normalizeAcompanhantes(
  acompanhantes: z.infer<typeof acompanhanteFormSchema>[],
) {
  return acompanhantes.map((acompanhante) => ({
    id: acompanhante.id,
    nomeCompleto: acompanhante.nomeCompleto.trim(),
    documento: acompanhante.documento?.trim() || undefined,
    menorDeIdade: acompanhante.menorDeIdade,
  }))
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '')
}
