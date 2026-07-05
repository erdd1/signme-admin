import { z } from 'zod'

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
)

export const churchFormSchema = z.object({
  nom: z.string().min(1, "Le nom de l'église est obligatoire").max(255),
  ville: z.string().min(1, 'La ville est obligatoire').max(100),
  region: optionalString,
  adresse: optionalString,
  telephone: optionalString,
  email: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.email('Adresse e-mail invalide').optional(),
  ),
})
export type ChurchFormValues = z.infer<typeof churchFormSchema>
