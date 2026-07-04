import { create } from 'zustand'

import type { AuthSession, AuthUser } from '@/features/auth/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  mfaSetupRequired: boolean
  setSession: (session: AuthSession) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setMfaSetupRequired: (value: boolean) => void
  clear: () => void
}

// Volontairement non persisté (pas de middleware `persist`) : les tokens ne
// doivent jamais toucher localStorage/sessionStorage pour ce dashboard admin.
// Conséquence assumée : un rechargement de page déconnecte l'utilisateur.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  mfaSetupRequired: false,
  setSession: ({ accessToken, refreshToken, user, mfaSetupRequired }) =>
    set({ accessToken, refreshToken, user, isAuthenticated: true, mfaSetupRequired }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setMfaSetupRequired: (mfaSetupRequired) => set({ mfaSetupRequired }),
  clear: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      mfaSetupRequired: false,
    }),
}))
