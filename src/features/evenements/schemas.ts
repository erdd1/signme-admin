import { z } from 'zod'

import { EVENEMENT_MODES } from '@/features/evenements/types'

const MAX_IMAGE_BYTES = 100 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
)

const imageSchema = z
  .instanceof(File)
  .optional()
  .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, "L'image ne doit pas dépasser 100 Ko")
  .refine(
    (file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type),
    'Formats acceptés : JPG, PNG, WEBP',
  )

export const createEvenementSchema = z
  .object({
    titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(150),
    description: z
      .string()
      .min(20, 'La description doit contenir au moins 20 caractères')
      .max(5000),
    dateDebut: z.string().min(1, 'La date de début est obligatoire'),
    dateFin: optionalString,
    objectifMontant: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : Number(value)),
      z.number().int().positive("L'objectif doit être un montant positif").optional(),
    ),
    mode: z.enum(EVENEMENT_MODES, 'Le mode de publication est obligatoire'),
    scheduledPublishAt: optionalString,
    churchId: z.number().int().positive('Veuillez sélectionner une église'),
    image: imageSchema,
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'planifie') {
      if (!data.scheduledPublishAt) {
        ctx.addIssue({
          code: 'custom',
          message: 'La date/heure de publication planifiée est requise',
          path: ['scheduledPublishAt'],
        })
      } else if (new Date(data.scheduledPublishAt).getTime() <= Date.now()) {
        ctx.addIssue({
          code: 'custom',
          message: 'La date de publication planifiée doit être dans le futur',
          path: ['scheduledPublishAt'],
        })
      }
    }
    if (data.dateFin && data.dateDebut && data.dateFin <= data.dateDebut) {
      ctx.addIssue({
        code: 'custom',
        message: 'La date de fin doit être supérieure à la date de début',
        path: ['dateFin'],
      })
    }
  })
export type CreateEvenementFormValues = z.infer<typeof createEvenementSchema>

export const updateEvenementSchema = z.object({
  titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(150),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(5000),
  dateFin: optionalString,
  objectifMontant: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : Number(value)),
    z.number().int().positive("L'objectif doit être un montant positif").optional(),
  ),
  image: imageSchema,
})
export type UpdateEvenementFormValues = z.infer<typeof updateEvenementSchema>
