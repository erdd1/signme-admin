import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as api from '@/features/anciens-designations/api/anciensDesignationsApi'

export function useDesignerAncien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.designerAncien,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['anciens-designations'] })
    },
  })
}
