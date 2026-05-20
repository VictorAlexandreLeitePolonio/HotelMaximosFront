import { z } from 'zod'
import type {
  CheckInDiretoInput,
  CheckInReservaInput,
  CheckInResult,
  CheckInDoDiaQuery,
  CheckInDoDiaItem,
  FormaPagamento,
} from '@/lib/api-contracts'

export const formaPagamentoOptions: FormaPagamento[] = [
  'Pix',
  'Dinheiro',
  'CartaoCredito',
  'CartaoDebito',
  'Transferencia',
]

export type CheckInReservaFormState = {
  dataInicioEfetiva: string
  dataFimPrevista: string
  formaPagamento: FormaPagamento | ''
  valorPago: string
  comprovante: string
  observacoes: string
}

export type CheckInDiretoFormState = {
  flatId: string
  hospedeResponsavelId: string
  acompanhanteIds: number[]
  dataInicio: string
  dataFimPrevista: string
  cafeContratado: boolean
  valorCafePorPessoa: string
  formaPagamento: FormaPagamento | ''
  valorPago: string
  comprovante: string
  observacoes: string
}

export type CheckInDrawerMode = 'reservation' | 'direct'

export const defaultCheckInDoDiaFilters: CheckInDoDiaQuery = {
  page: 1,
  pageSize: 10,
}

export const checkInReservaFormSchema = z
  .object({
    dataInicioEfetiva: z.string().min(1, 'Informe a data efetiva do check-in.'),
    dataFimPrevista: z.string().min(1, 'Informe a data fim prevista.'),
    formaPagamento: z.enum(formaPagamentoOptions as [FormaPagamento, ...FormaPagamento[]], {
      required_error: 'Selecione a forma de pagamento.',
    }),
    valorPago: z
      .string()
      .min(1, 'Informe o valor pago.')
      .refine((value) => normalizeMoneyInput(value) > 0, 'Informe um valor pago valido.'),
    comprovante: z.string().optional(),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(toDateOnlyIso(data.dataFimPrevista)).getTime() <= new Date(toIsoDateTime(data.dataInicioEfetiva)).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFimPrevista'],
        message: 'A data fim prevista deve ser posterior ao inicio efetivo.',
      })
    }

    if (requiresProof(data.formaPagamento) && !data.comprovante?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comprovante'],
        message: 'Comprovante e obrigatorio para essa forma de pagamento.',
      })
    }
  })

export const checkInDiretoFormSchema = z
  .object({
    flatId: z.string().min(1, 'Selecione o flat.'),
    hospedeResponsavelId: z.string().min(1, 'Selecione o hospede responsavel.'),
    acompanhanteIds: z.array(z.number().int().positive()),
    dataInicio: z.string().min(1, 'Informe a data efetiva do check-in.'),
    dataFimPrevista: z.string().min(1, 'Informe a data fim prevista.'),
    cafeContratado: z.boolean(),
    valorCafePorPessoa: z.string(),
    formaPagamento: z.enum(formaPagamentoOptions as [FormaPagamento, ...FormaPagamento[]], {
      required_error: 'Selecione a forma de pagamento.',
    }),
    valorPago: z
      .string()
      .min(1, 'Informe o valor pago.')
      .refine((value) => normalizeMoneyInput(value) > 0, 'Informe um valor pago valido.'),
    comprovante: z.string().optional(),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(toDateOnlyIso(data.dataFimPrevista)).getTime() <= new Date(toIsoDateTime(data.dataInicio)).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFimPrevista'],
        message: 'A data fim prevista deve ser posterior ao inicio efetivo.',
      })
    }

    if (data.cafeContratado && normalizeMoneyInput(data.valorCafePorPessoa) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['valorCafePorPessoa'],
        message: 'Informe o valor do cafe por pessoa.',
      })
    }

    if (requiresProof(data.formaPagamento) && !data.comprovante?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comprovante'],
        message: 'Comprovante e obrigatorio para essa forma de pagamento.',
      })
    }
  })

export function buildDefaultCheckInReservaFormState(reserva: CheckInDoDiaItem): CheckInReservaFormState {
  return {
    dataInicioEfetiva: toDateTimeLocalValue(new Date()),
    dataFimPrevista: toDateInputValue(reserva.dataFim),
    formaPagamento: '',
    valorPago: reserveTwoDecimals(reserva.valorTotalContratado),
    comprovante: '',
    observacoes: reserva.observacoes || '',
  }
}

export const defaultCheckInDiretoFormState: CheckInDiretoFormState = {
  flatId: '',
  hospedeResponsavelId: '',
  acompanhanteIds: [],
  dataInicio: toDateTimeLocalValue(new Date()),
  dataFimPrevista: toDateInputValue(addDays(new Date(), 30).toISOString()),
  cafeContratado: false,
  valorCafePorPessoa: '0.00',
  formaPagamento: '',
  valorPago: '',
  comprovante: '',
  observacoes: '',
}

export function normalizeCheckInReservaPayload(
  data: z.infer<typeof checkInReservaFormSchema>,
): CheckInReservaInput {
  return {
    dataInicioEfetiva: toIsoDateTime(data.dataInicioEfetiva),
    dataFimPrevista: toDateOnlyIso(data.dataFimPrevista),
    formaPagamento: data.formaPagamento,
    valorPago: normalizeMoneyInput(data.valorPago),
    comprovante: normalizeOptionalText(data.comprovante),
    observacoes: normalizeOptionalText(data.observacoes),
  }
}

export function normalizeCheckInDiretoPayload(
  data: z.infer<typeof checkInDiretoFormSchema>,
): CheckInDiretoInput {
  return {
    flatId: Number(data.flatId),
    hospedeResponsavelId: Number(data.hospedeResponsavelId),
    acompanhanteIds: data.acompanhanteIds,
    dataInicio: toIsoDateTime(data.dataInicio),
    dataFimPrevista: toDateOnlyIso(data.dataFimPrevista),
    cafeContratado: data.cafeContratado,
    valorCafePorPessoa: data.cafeContratado ? normalizeMoneyInput(data.valorCafePorPessoa) : 0,
    formaPagamento: data.formaPagamento,
    valorPago: normalizeMoneyInput(data.valorPago),
    comprovante: normalizeOptionalText(data.comprovante),
    observacoes: normalizeOptionalText(data.observacoes),
  }
}

export function buildCheckInResultMessage(result: CheckInResult) {
  return `Check-in concluido para o flat ${result.estadia.flat.numero}, com estadia #${result.estadia.id} e cobranca #${result.cobranca.id}.`
}

export function requiresProof(formaPagamento: FormaPagamento | '') {
  return Boolean(formaPagamento) && formaPagamento !== 'Dinheiro'
}

export function normalizeMoneyInput(value: string) {
  const normalized = Number(value.replace(',', '.'))
  return Number.isFinite(normalized) ? Number(normalized.toFixed(2)) : 0
}

export function reserveTwoDecimals(value: number) {
  return value.toFixed(2)
}

export function toDateInputValue(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDateTimeLocalValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function toDateOnlyIso(value: string) {
  return `${value}T12:00:00.000Z`
}

export function toIsoDateTime(value: string) {
  return new Date(value).toISOString()
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
