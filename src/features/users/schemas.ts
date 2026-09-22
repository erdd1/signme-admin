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

const matriculeField = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim().toUpperCase() : undefined,
  z
    .string()
    .regex(/^[HF]\d{3}$/, 'Format attendu : H001-H999 (homme) ou F001-F999 (femme)')
    .optional(),
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
  matricule: matriculeField,
  // Obligatoire uniquement pour le rôle paroissien (voir refineCommuniantRequired
  // ci-dessous) — les autres rôles sont et seront toujours communiants.
  estCommuniant: z.boolean().optional(),
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

function refineMatriculeRequiredWithChurch(
  data: { churchId?: number; matricule?: string; sexe?: string },
  ctx: z.RefinementCtx,
) {
  if (data.churchId === undefined) return

  if (!data.matricule) {
    ctx.addIssue({
      code: 'custom',
      message: "L'identifiant est obligatoire pour un membre rattaché à une église",
      path: ['matricule'],
    })
    return
  }

  const expectedPrefix = data.sexe === 'femme' ? 'F' : 'H'
  if (!data.matricule.startsWith(expectedPrefix)) {
    ctx.addIssue({
      code: 'custom',
      message: `L'identifiant doit commencer par "${expectedPrefix}" pour ce sexe`,
      path: ['matricule'],
    })
  }
}

function refineCommuniantRequiredForParoissien(
  data: { role: string; estCommuniant?: boolean },
  ctx: z.RefinementCtx,
) {
  if (data.role === 'paroissien' && data.estCommuniant === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'Le statut communiant/non communiant est obligatoire pour un paroissien',
      path: ['estCommuniant'],
    })
  }
}

export const createUserSchema = z
  .object({
    ...baseUserFields,
    password: strongPasswordSchema,
    churchId: optionalId,
  })
  .superRefine((data, ctx) => {
    refineGroupePrincipal(data, ctx)
    refineMatriculeRequiredWithChurch(data, ctx)
    refineCommuniantRequiredForParoissien(data, ctx)
  })
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object(baseUserFields).superRefine((data, ctx) => {
  refineGroupePrincipal(data, ctx)
  refineCommuniantRequiredForParoissien(data, ctx)
})
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>

export const createQuartierSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(150),
})
export type CreateQuartierFormValues = z.infer<typeof createQuartierSchema>

export const createGroupeSchema = createQuartierSchema
export type CreateGroupeFormValues = CreateQuartierFormValues

export const createVilleSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(150),
  estDiaspora: z.boolean(),
})
export type CreateVilleFormValues = z.infer<typeof createVilleSchema>
