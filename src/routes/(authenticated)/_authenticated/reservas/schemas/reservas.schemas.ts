import { z } from 'zod'
import type {
  CreateReservaInput,
  DisponibilidadeQuery,
  FlatOperationalStatus,
  ReservasQuery,
} from '@/lib/api-contracts'

const positiveIdSchema = z
  .string()
  .trim()
  .min(1, 'Selecione uma opcao.')
  .refine(
    (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    'Selecione uma opcao valida.',
  )

const dateSchema = z
  .string()
  .trim()
  .min(1, 'Informe a data.')
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T12:00:00.000Z`).getTime()),
    'Informe uma data valida.',
  )

export const reservaStatusOptions = ['Confirmada', 'Cancelada', 'NoShow'] as const

export const reservaFormSchema = z
  .object({
    flatId: positiveIdSchema,
    hospedeResponsavelId: positiveIdSchema,
    acompanhanteIds: z.array(positiveIdSchema),
    dataInicio: dateSchema,
    dataFim: dateSchema,
    categoriaId: z.string(),
    subcategoriaId: z.string(),
    cafeContratado: z.boolean(),
    valorCafePorPessoa: z.string(),
    observacoes: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const dataInicio = new Date(`${value.dataInicio}T12:00:00.000Z`)
    const dataFim = new Date(`${value.dataFim}T12:00:00.000Z`)

    if (dataInicio >= dataFim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dataFim'],
        message: 'A data final precisa ser posterior a data inicial.',
      })
    }

    const parsedCafe = normalizeMoneyInput(value.valorCafePorPessoa)

    if (value.cafeContratado && parsedCafe < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['valorCafePorPessoa'],
        message: 'Informe um valor de cafe valido.',
      })
    }
  })

export type DrawerMode = 'create' | 'view' | 'availability'

export type ReservaFormState = {
  flatId: string
  hospedeResponsavelId: string
  acompanhanteIds: string[]
  dataInicio: string
  dataFim: string
  categoriaId: string
  subcategoriaId: string
  cafeContratado: boolean
  valorCafePorPessoa: string
  observacoes: string
}

export type AvailabilityContext = {
  dataInicio: string
  dataFim: string
  categoriaId: string
  subcategoriaId: string
}

export const disponibilidadeStatusLabels: FlatOperationalStatus[] = [
  'Livre',
  'Reservado',
  'Ocupado',
  'AguardandoLimpeza',
  'Manutencao',
]

export const defaultReservasFilters: ReservasQuery = {
  page: 1,
  pageSize: 10,
  sortField: 'dataInicio',
  sortOrder: 'asc',
}

export const defaultDisponibilidadeFilters: DisponibilidadeQuery = {
  page: 1,
  pageSize: 24,
  dataInicio: getInputDateValue(),
  dataFim: getInputDateValue(1),
}

export const defaultReservaFormState: ReservaFormState = {
  flatId: '',
  hospedeResponsavelId: '',
  acompanhanteIds: [],
  dataInicio: getInputDateValue(),
  dataFim: getInputDateValue(1),
  categoriaId: '',
  subcategoriaId: '',
  cafeContratado: false,
  valorCafePorPessoa: '0',
  observacoes: '',
}

export function normalizeReservaCreatePayload(
  data: z.infer<typeof reservaFormSchema>,
): CreateReservaInput {
  return {
    flatId: Number(data.flatId),
    hospedeResponsavelId: Number(data.hospedeResponsavelId),
    acompanhanteIds: data.acompanhanteIds.map(Number),
    dataInicio: toApiDateTime(data.dataInicio),
    dataFim: toApiDateTime(data.dataFim),
    cafeContratado: data.cafeContratado,
    valorCafePorPessoa: data.cafeContratado ? normalizeMoneyInput(data.valorCafePorPessoa) : 0,
    observacoes: data.observacoes?.trim() || undefined,
  }
}

export function isDateRangeValid(dataInicio: string, dataFim: string) {
  if (!dataInicio || !dataFim) {
    return false
  }

  return new Date(`${dataInicio}T12:00:00.000Z`) < new Date(`${dataFim}T12:00:00.000Z`)
}

export function buildAvailabilityContext(formState: ReservaFormState): AvailabilityContext {
  return {
    dataInicio: formState.dataInicio,
    dataFim: formState.dataFim,
    categoriaId: formState.categoriaId,
    subcategoriaId: formState.subcategoriaId,
  }
}

function getInputDateValue(dayOffset = 0) {
  const current = new Date()
  current.setHours(0, 0, 0, 0)
  current.setDate(current.getDate() + dayOffset)

  const local = new Date(current.getTime() - current.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function toApiDateTime(value: string) {
  return new Date(`${value}T12:00:00.000Z`).toISOString()
}

function normalizeMoneyInput(value: string) {
  const normalized = Number(value.replace(',', '.'))

  if (!Number.isFinite(normalized) || normalized < 0) {
    return -1
  }

  return Math.round(normalized * 100) / 100
}
