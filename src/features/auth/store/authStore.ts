import { create } from 'zustand'

import type { AuthSession, AuthUser } from '@/features/auth/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  setTokens: (accessToken: string, refreshToken: string) => void
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
  setSession: ({ accessToken, refreshToken, user }) =>
    set({ accessToken, refreshToken, user, isAuthenticated: true }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  clear: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
}))
