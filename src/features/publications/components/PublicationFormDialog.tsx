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
import { useCreatePublication } from '@/features/publications/hooks/useCreatePublication'
import { useUpdatePublication } from '@/features/publications/hooks/useUpdatePublication'
import {
  type CreatePublicationFormValues,
  createPublicationSchema,
  makeUpdatePublicationSchema,
  type UpdatePublicationFormValues,
} from '@/features/publications/schemas'
import { type Publication, PUBLICATION_TYPES } from '@/features/publications/types'
import { useChurches } from '@/features/users/hooks/useChurches'

interface PublicationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publication?: Publication
}

function toFormDefaults(publication?: Publication): CreatePublicationFormValues {
  return {
    type: publication?.type ?? 'annonce',
    titre: publication?.titre ?? '',
    contenu: publication?.contenu ?? '',
    referenceBiblique: publication?.referenceBiblique ?? undefined,
    churchId: publication?.churchId ?? (undefined as unknown as number),
  }
}

export function PublicationFormDialog({
  open,
  onOpenChange,
  publication,
}: PublicationFormDialogProps) {
  const isEdit = !!publication
  const churches = useChurches()
  const createPublication = useCreatePublication()
  const updatePublication = useUpdatePublication()

  const form = useForm<CreatePublicationFormValues>({
    resolver: zodResolver(
      isEdit ? makeUpdatePublicationSchema(publication.type) : createPublicationSchema,
    ) as never,
    defaultValues: toFormDefaults(publication),
  })

  useEffect(() => {
    if (open) form.reset(toFormDefaults(publication))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, publication])

  const type = form.watch('type')

  async function onSubmit(values: CreatePublicationFormValues) {
    try {
      if (isEdit) {
        const payload: UpdatePublicationFormValues = {
          titre: values.titre,
          contenu: values.contenu,
          referenceBiblique: values.referenceBiblique,
        }
        await updatePublication.mutateAsync({ id: publication.id, payload })
        toast.success('Publication mise à jour avec succès.')
      } else {
        await createPublication.mutateAsync(values)
        toast.success('Publication créée avec succès.')
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
          <DialogTitle>{isEdit ? 'Modifier la publication' : 'Nouvelle publication'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Le type et l’église ne peuvent pas être changés après création.'
              : 'Une méditation nécessite une référence biblique.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="publication-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.type}>
              <FieldLabel>Type</FieldLabel>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select disabled={isEdit} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          ({ annonce: 'Annonce', meditation: 'Méditation' })[value]
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PUBLICATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t === 'annonce' ? 'Annonce' : 'Méditation'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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

            <Field className="col-span-2" data-invalid={!!form.formState.errors.titre}>
              <FieldLabel htmlFor="titre">Titre</FieldLabel>
              <Input id="titre" {...form.register('titre')} />
              <FieldError
                errors={form.formState.errors.titre ? [form.formState.errors.titre] : undefined}
              />
            </Field>

            <Field className="col-span-2" data-invalid={!!form.formState.errors.contenu}>
              <FieldLabel htmlFor="contenu">Contenu</FieldLabel>
              <Textarea id="contenu" rows={5} {...form.register('contenu')} />
              <FieldError
                errors={form.formState.errors.contenu ? [form.formState.errors.contenu] : undefined}
              />
            </Field>

            {type === 'meditation' && (
              <Field
                className="col-span-2"
                data-invalid={!!form.formState.errors.referenceBiblique}
              >
                <FieldLabel htmlFor="referenceBiblique">Référence biblique</FieldLabel>
                <Input
                  id="referenceBiblique"
                  placeholder="Ex : Jean 3:16"
                  {...form.register('referenceBiblique')}
                />
                <FieldError
                  errors={
                    form.formState.errors.referenceBiblique
                      ? [form.formState.errors.referenceBiblique]
                      : undefined
                  }
                />
              </Field>
            )}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="publication-form"
            disabled={createPublication.isPending || updatePublication.isPending}
          >
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
