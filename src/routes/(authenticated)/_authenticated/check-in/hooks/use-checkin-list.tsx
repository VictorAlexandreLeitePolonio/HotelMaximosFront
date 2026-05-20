import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { CheckInDoDiaItem } from '@/lib/api-contracts'
import { listCheckInDoDia } from '@/lib/http'
import {
  defaultCheckInDoDiaFilters,
  toDateInputValue,
} from '@/routes/(authenticated)/_authenticated/check-in/schemas/checkin.schemas'

export function useCheckInList() {
  const [filters, setFilters] = useState(defaultCheckInDoDiaFilters)
  const [draftReferenceDate, setDraftReferenceDate] = useState(toDateInputValue(new Date().toISOString()))

  const checkInDoDiaQuery = useQuery({
    queryKey: ['check-in-do-dia', filters],
    queryFn: () => listCheckInDoDia(filters),
    placeholderData: keepPreviousData,
  })

  const groupedData = useMemo(() => {
    const items = checkInDoDiaQuery.data?.data || []

    return {
      atrasado: items.filter((item) => item.grupoCheckIn === 'Atrasado') as CheckInDoDiaItem[],
      hoje: items.filter((item) => item.grupoCheckIn === 'Hoje') as CheckInDoDiaItem[],
    }
  }, [checkInDoDiaQuery.data?.data])

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      page: 1,
      referenceDate: draftReferenceDate ? `${draftReferenceDate}T12:00:00.000Z` : undefined,
    }))
  }

  return {
    applyFilters,
    checkInDoDiaQuery,
    currentPage: checkInDoDiaQuery.data?.meta.page || filters.page,
    draftReferenceDate,
    groupedData,
    setDraftReferenceDate,
    setFilters,
    totalPages: checkInDoDiaQuery.data?.meta.totalPages || 1,
  }
}
