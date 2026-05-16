import { create } from 'zustand'
import type { SafeAuthUser } from '@/lib/api-contracts'

export type AuthStatus = 'idle' | 'hydrating' | 'authenticated' | 'anonymous'

type AuthState = {
  status: AuthStatus
  accessToken: string | null
  refreshToken: string | null
  user: SafeAuthUser | null
  setHydrating: () => void
  setSession: (session: {
    accessToken: string
    refreshToken: string
    user: SafeAuthUser
  }) => void
  clearSession: () => void
  updateUser: (updater: (user: SafeAuthUser) => SafeAuthUser) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'idle',
  accessToken: null,
  refreshToken: null,
  user: null,
  setHydrating: () => {
    set((state) => ({
      ...state,
      status: 'hydrating',
    }))
  },
  setSession: ({ accessToken, refreshToken, user }) => {
    set({
      status: 'authenticated',
      accessToken,
      refreshToken,
      user,
    })
  },
  clearSession: () => {
    set({
      status: 'anonymous',
      accessToken: null,
      refreshToken: null,
      user: null,
    })
  },
  updateUser: (updater) => {
    set((state) => ({
      ...state,
      user: state.user ? updater(state.user) : null,
    }))
  },
}))
