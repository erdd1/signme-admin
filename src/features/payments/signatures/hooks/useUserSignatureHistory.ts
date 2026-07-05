import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import * as signaturePaymentsApi from '@/features/payments/signatures/api/signaturePaymentsApi'

export function useUserSignatureHistory(userId: number | undefined) {
  return useQuery({
    queryKey: ['signature-payments', 'user-history', userId] as const,
    queryFn: async () => {
      try {
        return await signaturePaymentsApi.getUserSignatureHistory(userId!)
      } catch (error) {
        // 404 = aucun historique pour cet utilisateur, pas une vraie erreur.
        if (error instanceof AxiosError && error.response?.status === 404) {
          return {
            userId: userId!,
            stats: { total: 0, completed: 0, pending: 0, failed: 0 },
            logs: [],
          }
        }
        throw error
      }
    },
    enabled: userId !== undefined,
  })
}
