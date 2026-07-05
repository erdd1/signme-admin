import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'
import { useCreateChurch } from '@/features/churches/hooks/useCreateChurch'
import { useUpdateChurch } from '@/features/churches/hooks/useUpdateChurch'
import { churchFormSchema, type ChurchFormValues } from '@/features/churches/schemas'
import type { Church } from '@/features/churches/types'

interface ChurchFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church?: Church
}

function toFormDefaults(church?: Church): ChurchFormValues {
  return {
    nom: church?.nom ?? '',
    ville: church?.ville ?? '',
    region: church?.region ?? undefined,
    adresse: church?.adresse ?? undefined,
    telephone: church?.telephone ?? undefined,
    email: church?.email ?? undefined,
  }
}

export function ChurchFormDialog({ open, onOpenChange, church }: ChurchFormDialogProps) {
  const isEdit = !!church
  const createChurch = useCreateChurch()
  const updateChurch = useUpdateChurch()

  const form = useForm<ChurchFormValues>({
    // Le preprocess Zod (chaîne vide -> undefined) rend le type d'entrée du
    // resolver incompatible avec ChurchFormValues aux yeux de TS — même
    // contournement que UserFormDialog.
    resolver: zodResolver(churchFormSchema) as never,
    defaultValues: toFormDefaults(church),
  })

  useEffect(() => {
    if (open) form.reset(toFormDefaults(church))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, church])

  async function onSubmit(values: ChurchFormValues) {
    try {
      if (isEdit) {
        await updateChurch.mutateAsync({ id: church.id, payload: values })
        toast.success('Église mise à jour avec succès.')
      } else {
        await createChurch.mutateAsync(values)
        toast.success('Église créée avec succès.')
      }
      onOpenChange(false)
    } catch (error) {
      const applied = applyServerErrors(error, form)
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier l’église' : 'Nouvelle église'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Laisser un champ optionnel vide le videra définitivement.'
              : 'Le nom et la ville identifient une église de manière unique.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="church-form"
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
            <Field data-invalid={!!form.formState.errors.ville}>
              <FieldLabel htmlFor="ville">Ville</FieldLabel>
              <Input id="ville" {...form.register('ville')} />
              <FieldError
                errors={form.formState.errors.ville ? [form.formState.errors.ville] : undefined}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="region">Région</FieldLabel>
              <Input id="region" {...form.register('region')} />
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" {...form.register('email')} />
              <FieldError
                errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="telephone">Téléphone</FieldLabel>
              <Input id="telephone" {...form.register('telephone')} />
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="adresse">Adresse</FieldLabel>
              <Input id="adresse" {...form.register('adresse')} />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="church-form"
            disabled={createChurch.isPending || updateChurch.isPending}
          >
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
