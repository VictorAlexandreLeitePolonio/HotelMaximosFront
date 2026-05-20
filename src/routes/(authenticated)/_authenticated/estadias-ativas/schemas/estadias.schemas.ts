import { z } from 'zod'
import type {
  Estadia,
  EstadiasAtivasQuery,
  RenovarEstadiaInput,
  TransferirFlatInput,
} from '@/lib/api-contracts'

export type EstadiaDrawerMode = 'view' | 'transfer' | 'renew'

export type TransferFlatFormState = {
  novoFlatId: string
  observacoes: string
}

export type RenewStayFormState = {
  dataFimPrevista: string
  observacoes: string
}

export const defaultEstadiasAtivasFilters: EstadiasAtivasQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'dataInicio',
  sortOrder: 'asc',
}

export const transferFlatFormSchema = z.object({
  novoFlatId: z.string().min(1, 'Selecione o novo flat.'),
  observacoes: z.string().optional(),
})

export const renewStayFormSchema = z
  .object({
    dataFimPrevista: z.string().min(1, 'Informe a nova data fim prevista.'),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(toDateOnlyIso(data.dataFimPrevista)).getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFimPrevista'],
        message: 'A nova data fim prevista deve ser futura.',
      })
    }
  })

export function buildDefaultTransferFlatFormState(): TransferFlatFormState {
  return {
    novoFlatId: '',
    observacoes: '',
  }
}

export function buildDefaultRenewStayFormState(estadia: Estadia): RenewStayFormState {
  return {
    dataFimPrevista: toDateInputValue(addDays(new Date(estadia.dataFimPrevista), 30).toISOString()),
    observacoes: '',
  }
}

export function normalizeTransferFlatPayload(
  data: z.infer<typeof transferFlatFormSchema>,
): TransferirFlatInput {
  return {
    novoFlatId: Number(data.novoFlatId),
    observacoes: normalizeOptionalText(data.observacoes),
  }
}

export function normalizeRenewStayPayload(
  data: z.infer<typeof renewStayFormSchema>,
): RenovarEstadiaInput {
  return {
    dataFimPrevista: toDateOnlyIso(data.dataFimPrevista),
    observacoes: normalizeOptionalText(data.observacoes),
  }
}

export function toDateInputValue(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDateOnlyIso(value: string) {
  return `${value}T12:00:00.000Z`
}

export function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
