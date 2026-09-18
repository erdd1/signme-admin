import { keepPreviousData, useQuery } from '@tanstack/react-query'

import * as systemeApi from '@/features/systeme/api/systemeApi'

export function backupsQueryKey(page: number) {
  return ['systeme', 'backups', page] as const
}

export function useBackups(page: number) {
  return useQuery({
    queryKey: backupsQueryKey(page),
    queryFn: () => systemeApi.getBackups(page),
    placeholderData: keepPreviousData,
    // Une sauvegarde manuelle/planifiée est asynchrone (job en file) — ce
    // polling permet de voir son statut passer de "pending" à "success"
    // sans action de l'admin.
    refetchInterval: 15_000,
  })
}
