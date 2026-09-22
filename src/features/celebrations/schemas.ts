import { z } from 'zod'

export const celebrationTypeFormSchema = z.object({
  titre: z.string().min(3, 'Le titre est obligatoire').max(150),
  messageTemplate: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(1000),
})

export type CelebrationTypeFormValues = z.infer<typeof celebrationTypeFormSchema>
