import { useEffect } from 'react'
import { bootstrapAuthSession } from '@/lib/auth-session'

export function AuthBootstrap() {
  useEffect(() => {
    bootstrapAuthSession()
  }, [])

  return null
}
