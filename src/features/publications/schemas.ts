import { z } from 'zod'

import { PUBLICATION_TYPES } from '@/features/publications/types'

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
)

function refineReferenceBiblique<T extends { type: string; referenceBiblique?: string }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.type === 'meditation' && !data.referenceBiblique) {
    ctx.addIssue({
      code: 'custom',
      message: 'La référence biblique est obligatoire pour une méditation',
      path: ['referenceBiblique'],
    })
  }
}

export const createPublicationSchema = z
  .object({
    type: z.enum(PUBLICATION_TYPES, 'Le type est obligatoire'),
    titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255),
    contenu: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
    referenceBiblique: optionalString,
    churchId: z.number().int().positive('Veuillez sélectionner une église'),
  })
  .superRefine(refineReferenceBiblique)
export type CreatePublicationFormValues = z.infer<typeof createPublicationSchema>

const baseUpdateFields = {
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255),
  contenu: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  referenceBiblique: optionalString,
}

export const updatePublicationSchema = z.object(baseUpdateFields)
export type UpdatePublicationFormValues = z.infer<typeof updatePublicationSchema>

/** Ré-applique la contrainte "référence biblique obligatoire" en édition,
 * car le champ `type` n'est pas modifiable et n'existe donc pas dans ce
 * formulaire — le type d'origine de la publication doit être fourni. */
export function makeUpdatePublicationSchema(originalType: string) {
  return z
    .object(baseUpdateFields)
    .superRefine((data, ctx) => refineReferenceBiblique({ ...data, type: originalType }, ctx))
}
