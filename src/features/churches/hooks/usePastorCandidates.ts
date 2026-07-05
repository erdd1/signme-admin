import { useQuery } from '@tanstack/react-query'

import * as churchesApi from '@/features/churches/api/churchesApi'

export function usePastorCandidates() {
  return useQuery({
    queryKey: ['churches', 'pastor-candidates'] as const,
    queryFn: churchesApi.getPastorCandidates,
    staleTime: 60 * 1000,
  })
}
