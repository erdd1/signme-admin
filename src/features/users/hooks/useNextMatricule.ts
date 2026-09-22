import { useMutation } from '@tanstack/react-query'

import * as usersApi from '@/features/users/api/usersApi'
import type { Sexe } from '@/features/users/types'

export function useNextMatricule() {
  return useMutation({
    mutationFn: ({ churchId, sexe }: { churchId: number; sexe: Sexe }) =>
      usersApi.getNextMatricule(churchId, sexe),
  })
}
