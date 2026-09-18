import { z } from 'zod'

export const createAdminSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(255),
  email: z.email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>
