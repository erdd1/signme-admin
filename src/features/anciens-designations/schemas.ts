import { z } from 'zod'

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const optionalTime = z
  .string()
  .regex(HHMM_REGEX, 'Format attendu : HH:MM (ex: 08:00)')
  .optional()
  .or(z.literal('').transform(() => undefined))

export const designerAncienSchema = z
  .object({
    joursTravail: z.array(z.number().int().min(1).max(7)).max(7),
    horaireDebut: optionalTime,
    horaireFin: optionalTime,
  })
  .superRefine((data, ctx) => {
    if (data.horaireDebut && data.horaireFin && data.horaireFin <= data.horaireDebut) {
      ctx.addIssue({
        code: 'custom',
        message: "L'horaire de fin doit être postérieur à l'horaire de début",
        path: ['horaireFin'],
      })
    }
  })

export type DesignerAncienFormValues = z.infer<typeof designerAncienSchema>
