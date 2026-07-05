import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'
import { useCreateEvenement } from '@/features/evenements/hooks/useCreateEvenement'
import { useUpdateEvenement } from '@/features/evenements/hooks/useUpdateEvenement'
import {
  type CreateEvenementFormValues,
  createEvenementSchema,
  updateEvenementSchema,
} from '@/features/evenements/schemas'
import { type Evenement, EVENEMENT_MODES } from '@/features/evenements/types'
import { useChurches } from '@/features/users/hooks/useChurches'

interface EvenementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evenement?: Evenement
}

const MODE_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  immediate: 'Publier immédiatement',
  planifie: 'Planifier',
}

function toDateInputValue(iso: string | null): string | undefined {
  return iso ? iso.slice(0, 10) : undefined
}

function toFormDefaults(evenement?: Evenement): CreateEvenementFormValues {
  return {
    titre: evenement?.titre ?? '',
    description: evenement?.description ?? '',
    dateDebut: evenement?.dateDebut ?? '',
    dateFin: toDateInputValue(evenement?.dateFin ?? null),
    objectifMontant: evenement?.objectifMontant ?? undefined,
    mode: 'immediate',
    scheduledPublishAt: undefined,
    churchId: evenement?.church.id ?? (undefined as unknown as number),
    image: undefined,
  }
}

export function EvenementFormDialog({ open, onOpenChange, evenement }: EvenementFormDialogProps) {
  const isEdit = !!evenement
  const churches = useChurches()
  const createEvenement = useCreateEvenement()
  const updateEvenement = useUpdateEvenement()

  const form = useForm<CreateEvenementFormValues>({
    resolver: zodResolver(isEdit ? updateEvenementSchema : createEvenementSchema) as never,
    defaultValues: toFormDefaults(evenement),
  })

  useEffect(() => {
    if (open) form.reset(toFormDefaults(evenement))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, evenement])

  const mode = form.watch('mode')

  async function onSubmit(values: CreateEvenementFormValues) {
    try {
      if (isEdit) {
        await updateEvenement.mutateAsync({
          uuid: evenement.uuid,
          payload: {
            titre: values.titre,
            description: values.description,
            dateFin: values.dateFin,
            objectifMontant: values.objectifMontant,
            image: values.image,
          },
        })
        toast.success('Événement mis à jour avec succès.')
      } else {
        await createEvenement.mutateAsync(values)
        toast.success('Événement créé avec succès.')
      }
      onOpenChange(false)
    } catch (error) {
      const applied = applyServerErrors(error, form)
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'événement" : 'Nouvel événement'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Le mode de publication, la date de début et l'église ne peuvent pas être changés."
              : 'Choisissez un mode de publication : brouillon, immédiat, ou planifié à une date future.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="evenement-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="col-span-2" data-invalid={!!form.formState.errors.titre}>
              <FieldLabel htmlFor="titre">Titre</FieldLabel>
              <Input id="titre" {...form.register('titre')} />
              <FieldError
                errors={form.formState.errors.titre ? [form.formState.errors.titre] : undefined}
              />
            </Field>

            <Field className="col-span-2" data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea id="description" rows={4} {...form.register('description')} />
              <FieldError
                errors={
                  form.formState.errors.description
                    ? [form.formState.errors.description]
                    : undefined
                }
              />
            </Field>

            {!isEdit && (
              <Field data-invalid={!!form.formState.errors.dateDebut}>
                <FieldLabel htmlFor="dateDebut">Date de début</FieldLabel>
                <Input id="dateDebut" type="date" {...form.register('dateDebut')} />
                <FieldError
                  errors={
                    form.formState.errors.dateDebut ? [form.formState.errors.dateDebut] : undefined
                  }
                />
              </Field>
            )}

            <Field data-invalid={!!form.formState.errors.dateFin}>
              <FieldLabel htmlFor="dateFin">Date de fin (optionnelle)</FieldLabel>
              <Input id="dateFin" type="date" {...form.register('dateFin')} />
              <FieldError
                errors={form.formState.errors.dateFin ? [form.formState.errors.dateFin] : undefined}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.objectifMontant}>
              <FieldLabel htmlFor="objectifMontant">
                Objectif financier (FCFA, optionnel)
              </FieldLabel>
              <Input id="objectifMontant" type="number" {...form.register('objectifMontant')} />
              <FieldError
                errors={
                  form.formState.errors.objectifMontant
                    ? [form.formState.errors.objectifMontant]
                    : undefined
                }
              />
            </Field>

            {!isEdit && (
              <Field data-invalid={!!form.formState.errors.churchId}>
                <FieldLabel>Église</FieldLabel>
                <Controller
                  control={form.control}
                  name="churchId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) =>
                            churches.data?.find((c) => String(c.id) === value)?.nom ?? 'Choisir'
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
                <FieldError
                  errors={
                    form.formState.errors.churchId ? [form.formState.errors.churchId] : undefined
                  }
                />
              </Field>
            )}

            {!isEdit && (
              <Field data-invalid={!!form.formState.errors.mode}>
                <FieldLabel>Mode de publication</FieldLabel>
                <Controller
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => MODE_LABELS[value]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {EVENEMENT_MODES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {MODE_LABELS[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}

            {!isEdit && mode === 'planifie' && (
              <Field
                className="col-span-2"
                data-invalid={!!form.formState.errors.scheduledPublishAt}
              >
                <FieldLabel htmlFor="scheduledPublishAt">Date/heure de publication</FieldLabel>
                <Input
                  id="scheduledPublishAt"
                  type="datetime-local"
                  {...form.register('scheduledPublishAt')}
                />
                <FieldError
                  errors={
                    form.formState.errors.scheduledPublishAt
                      ? [form.formState.errors.scheduledPublishAt]
                      : undefined
                  }
                />
              </Field>
            )}

            <Field className="col-span-2" data-invalid={!!form.formState.errors.image}>
              <FieldLabel htmlFor="image">Image (JPG/PNG/WEBP, max 100 Ko)</FieldLabel>
              <Controller
                control={form.control}
                name="image"
                render={({ field: { onChange, ref, name, onBlur } }) => (
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={(event) => onChange(event.target.files?.[0])}
                  />
                )}
              />
              <FieldError
                errors={form.formState.errors.image ? [form.formState.errors.image] : undefined}
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
            form="evenement-form"
            disabled={createEvenement.isPending || updateEvenement.isPending}
          >
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
