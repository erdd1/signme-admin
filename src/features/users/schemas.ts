import { z } from 'zod'

import { strongPasswordSchema } from '@/features/auth/schemas'
import { REGIONS, ROLES, SEXES } from '@/features/users/types'

const optionalId = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
  z.number().int().positive().optional(),
)

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
)

const baseUserFields = {
  nom: z.string().min(1, 'Le nom est obligatoire').max(255),
  email: z.email('Adresse e-mail invalide'),
  role: z.enum(ROLES, 'Le rôle est obligatoire'),
  telephone: optionalString,
  profession: optionalString,
  originaireDe: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.enum(REGIONS).optional(),
  ),
  sexe: z.preprocess((value) => (value === '' ? undefined : value), z.enum(SEXES).optional()),
  dateNaissance: optionalString,
  dateConfirmation: optionalString,
  lieuConfirmation: optionalString,
  quartierId: optionalId,
  villeId: optionalId,
  groupeIds: z.array(z.number().int().positive()).default([]),
  groupePrincipalId: optionalId,
}

function refineGroupePrincipal<T extends { groupeIds: number[]; groupePrincipalId?: number }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.groupePrincipalId !== undefined && !data.groupeIds.includes(data.groupePrincipalId)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Le groupe principal doit faire partie des groupes sélectionnés',
      path: ['groupePrincipalId'],
    })
  }
}

export const createUserSchema = z
  .object({
    ...baseUserFields,
    password: strongPasswordSchema,
    churchId: optionalId,
  })
  .superRefine(refineGroupePrincipal)
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object(baseUserFields).superRefine(refineGroupePrincipal)
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
