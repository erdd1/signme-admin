import { zodResolver } from '@hookform/resolvers/zod'
import { Dices } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'
import { UserPhotoUpload } from '@/features/users/components/UserPhotoUpload'
import { useChurches } from '@/features/users/hooks/useChurches'
import { useCreateUser } from '@/features/users/hooks/useCreateUser'
import { useGroupes } from '@/features/users/hooks/useGroupes'
import { useQuartiers } from '@/features/users/hooks/useQuartiers'
import { useUpdateUser } from '@/features/users/hooks/useUpdateUser'
import { useVilles } from '@/features/users/hooks/useVilles'
import {
  type CreateUserFormValues,
  createUserSchema,
  updateUserSchema,
} from '@/features/users/schemas'
import { REGIONS, ROLES, SEXES, type User } from '@/features/users/types'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
}

function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%^&*?'
  const all = upper + lower + digits + special
  const pick = (pool: string) => pool[Math.floor(Math.random() * pool.length)]
  const chars = [
    pick(upper),
    pick(lower),
    pick(digits),
    pick(special),
    ...Array.from({ length: 10 }, () => pick(all)),
  ]
  return chars.sort(() => Math.random() - 0.5).join('')
}

function toFormDefaults(user?: User): CreateUserFormValues {
  return {
    nom: user?.nom ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'paroissien',
    churchId: user?.churchId ?? undefined,
    telephone: user?.telephone ?? undefined,
    profession: user?.profession ?? undefined,
    originaireDe: user?.originaireDe ?? undefined,
    sexe: user?.sexe ?? undefined,
    dateNaissance: user?.dateNaissance ?? undefined,
    dateConfirmation: user?.dateConfirmation ?? undefined,
    lieuConfirmation: user?.lieuConfirmation ?? undefined,
    quartierId: user?.quartier?.id,
    villeId: user?.ville?.id,
    groupeIds: user?.groupes.map((g) => g.id) ?? [],
    groupePrincipalId: user?.groupePrincipal?.id,
  }
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = !!user
  const churches = useChurches()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm<CreateUserFormValues>({
    // Le schéma dépend du mode (création exige un mot de passe fort, pas
    // l'édition) — isEdit est figé pour toute la durée de vie du composant
    // (la liste remonte le dialog via une `key` différente par utilisateur).
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema) as never,
    defaultValues: toFormDefaults(user),
  })

  useEffect(() => {
    if (open) form.reset(toFormDefaults(user))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const churchId = form.watch('churchId')
  const effectiveChurchId = isEdit ? (user.churchId ?? undefined) : churchId
  const quartiers = useQuartiers(effectiveChurchId)
  const villes = useVilles(effectiveChurchId)
  const groupes = useGroupes(effectiveChurchId)
  const groupeIds = form.watch('groupeIds')

  function toggleGroupe(id: number, checked: boolean) {
    const current = form.getValues('groupeIds')
    form.setValue('groupeIds', checked ? [...current, id] : current.filter((g) => g !== id))
    if (!checked && form.getValues('groupePrincipalId') === id) {
      form.setValue('groupePrincipalId', undefined)
    }
  }

  function handleGeneratePassword() {
    form.setValue('password', generateStrongPassword(), { shouldValidate: true })
  }

  async function onSubmit(values: CreateUserFormValues) {
    try {
      if (isEdit) {
        const { password: _password, churchId: _churchId, ...payload } = values
        await updateUser.mutateAsync({ id: user.id, payload })
        toast.success('Utilisateur mis à jour avec succès.')
      } else {
        await createUser.mutateAsync(values)
        toast.success('Utilisateur créé avec succès.')
      }
      onOpenChange(false)
    } catch (error) {
      const applied = applyServerErrors(error, form)
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "L'église d'un membre ne peut pas être changée depuis cet écran."
              : 'Le mot de passe sera communiqué manuellement à ce membre.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && <UserPhotoUpload userId={user.id} nom={user.nom} photoUrl={user.photoUrl} />}

        <form
          id="user-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.nom}>
              <FieldLabel htmlFor="nom">Nom</FieldLabel>
              <Input id="nom" {...form.register('nom')} />
              <FieldError
                errors={form.formState.errors.nom ? [form.formState.errors.nom] : undefined}
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" {...form.register('email')} />
              <FieldError
                errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.role}>
              <FieldLabel>Rôle</FieldLabel>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                errors={form.formState.errors.role ? [form.formState.errors.role] : undefined}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.churchId}>
              <FieldLabel>Église</FieldLabel>
              <Controller
                control={form.control}
                name="churchId"
                render={({ field }) => (
                  <Select
                    disabled={isEdit}
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          churches.data?.find((c) => String(c.id) === value)?.nom ?? 'Aucune'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {churches.data?.map((church) => (
                        <SelectItem key={church.id} value={String(church.id)}>
                          {church.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {!isEdit && (
              <Field data-invalid={!!form.formState.errors.password} className="col-span-2">
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <div className="flex gap-2">
                  <Input id="password" {...form.register('password')} className="font-mono" />
                  <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                    <Dices /> Générer
                  </Button>
                </div>
                <FieldError
                  errors={
                    form.formState.errors.password ? [form.formState.errors.password] : undefined
                  }
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="telephone">Téléphone</FieldLabel>
              <Input id="telephone" {...form.register('telephone')} />
            </Field>
            <Field>
              <FieldLabel htmlFor="profession">Profession</FieldLabel>
              <Input id="profession" {...form.register('profession')} />
            </Field>

            <Field>
              <FieldLabel>Sexe</FieldLabel>
              <Controller
                control={form.control}
                name="sexe"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Non renseigné" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEXES.map((sexe) => (
                        <SelectItem key={sexe} value={sexe}>
                          {sexe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel>Région d'origine</FieldLabel>
              <Controller
                control={form.control}
                name="originaireDe"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Non renseignée" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dateNaissance">Date de naissance</FieldLabel>
              <Input id="dateNaissance" type="date" {...form.register('dateNaissance')} />
            </Field>
            <Field>
              <FieldLabel htmlFor="dateConfirmation">Date de confirmation</FieldLabel>
              <Input id="dateConfirmation" type="date" {...form.register('dateConfirmation')} />
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="lieuConfirmation">Lieu de confirmation</FieldLabel>
              <Input id="lieuConfirmation" {...form.register('lieuConfirmation')} />
            </Field>

            <Field>
              <FieldLabel>Quartier</FieldLabel>
              <Controller
                control={form.control}
                name="quartierId"
                render={({ field }) => (
                  <Select
                    disabled={!effectiveChurchId}
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          quartiers.data?.find((q) => String(q.id) === value)?.nom ?? 'Aucun'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {quartiers.data?.map((q) => (
                        <SelectItem key={q.id} value={String(q.id)}>
                          {q.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel>Ville</FieldLabel>
              <Controller
                control={form.control}
                name="villeId"
                render={({ field }) => (
                  <Select
                    disabled={!effectiveChurchId}
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => {
                          const ville = villes.data?.find((v) => String(v.id) === value)
                          return ville
                            ? `${ville.nom} ${ville.estDiaspora ? '(diaspora)' : ''}`
                            : 'Aucune'
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {villes.data?.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.nom} {v.estDiaspora ? '(diaspora)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel>Groupes</FieldLabel>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {!effectiveChurchId && (
                  <p className="text-muted-foreground col-span-2 text-sm">
                    Choisissez une église pour voir ses groupes.
                  </p>
                )}
                {groupes.data?.map((groupe) => (
                  <label key={groupe.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={groupeIds.includes(groupe.id)}
                      onCheckedChange={(checked) => toggleGroupe(groupe.id, checked === true)}
                    />
                    {groupe.nom}
                  </label>
                ))}
              </div>
            </Field>

            <Field className="col-span-2" data-invalid={!!form.formState.errors.groupePrincipalId}>
              <FieldLabel>Groupe principal</FieldLabel>
              <Controller
                control={form.control}
                name="groupePrincipalId"
                render={({ field }) => (
                  <Select
                    disabled={groupeIds.length === 0}
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          groupes.data?.find((g) => String(g.id) === value)?.nom ?? 'Aucun'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {groupes.data
                        ?.filter((g) => groupeIds.includes(g.id))
                        .map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.nom}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                errors={
                  form.formState.errors.groupePrincipalId
                    ? [form.formState.errors.groupePrincipalId]
                    : undefined
                }
              />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={createUser.isPending || updateUser.isPending}
          >
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
