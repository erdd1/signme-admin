import { z } from 'zod'

import { SIGNATURE_STATUSES } from '@/features/signatures/types'

export const createSignaturesSchema = z.object({
  userId: z.number().int().positive('Veuillez sélectionner un paroissien'),
  months: z
    .array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/))
    .min(1, 'Sélectionnez au moins un mois')
    .max(12, 'Maximum 12 mois à la fois'),
  amount: z
    .number('Le montant est obligatoire')
    .int()
    .min(100, 'Le montant minimum est de 100 FCFA')
    .max(500000, 'Le montant maximum est de 500 000 FCFA'),
})
export type CreateSignaturesFormValues = z.infer<typeof createSignaturesSchema>

export const updateSignatureSchema = z.object({
  status: z.enum(SIGNATURE_STATUSES, 'Le statut est obligatoire'),
  amount: z.number('Le montant est obligatoire').int().min(0),
  fees: z.number('Les frais sont obligatoires').int().min(0),
})
export type UpdateSignatureFormValues = z.infer<typeof updateSignatureSchema>
