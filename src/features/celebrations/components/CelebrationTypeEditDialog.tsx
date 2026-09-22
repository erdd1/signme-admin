import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'

import { useUpdateCelebrationType } from '../hooks/useUpdateCelebrationType'
import { celebrationTypeFormSchema, type CelebrationTypeFormValues } from '../schemas'
import type { CelebrationType } from '../types'

interface CelebrationTypeEditDialogProps {
  type: CelebrationType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Placeholders reconnus par le backend, résolus à la lecture (nom de
 * l'utilisateur / nom de son église) — jamais stockés en dur ailleurs. */
const PLACEHOLDER_HINT = 'Utilisez {nom} et {eglise} — remplacés automatiquement.'

function toFormDefaults(type: CelebrationType | null): CelebrationTypeFormValues {
  return {
    titre: type?.titre ?? '',
    messageTemplate: type?.messageTemplate ?? '',
  }
}

export function CelebrationTypeEditDialog({
  type,
  open,
  onOpenChange,
}: CelebrationTypeEditDialogProps) {
  const updateType = useUpdateCelebrationType()

  const form = useForm<CelebrationTypeFormValues>({
    resolver: zodResolver(celebrationTypeFormSchema),
    defaultValues: toFormDefaults(type),
  })

  useEffect(() => {
    if (open) form.reset(toFormDefaults(type))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type])

  async function onSubmit(values: CelebrationTypeFormValues) {
    if (!type) return
    try {
      await updateType.mutateAsync({ id: type.id, payload: values })
      toast.success('Type de célébration mis à jour')
      onOpenChange(false)
    } catch (error) {
      const applied = applyServerErrors(error, form)
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier — {type?.label}</DialogTitle>
        </DialogHeader>

        <form
          id="celebration-type-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid gap-4">
            <Field data-invalid={!!form.formState.errors.titre}>
              <FieldLabel htmlFor="titre">Titre (notification)</FieldLabel>
              <Input id="titre" {...form.register('titre')} maxLength={150} />
              <FieldError
                errors={form.formState.errors.titre ? [form.formState.errors.titre] : undefined}
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.messageTemplate}>
              <FieldLabel htmlFor="messageTemplate">Message</FieldLabel>
              <Textarea
                id="messageTemplate"
                rows={5}
                maxLength={1000}
                {...form.register('messageTemplate')}
              />
              <p className="text-muted-foreground text-xs">{PLACEHOLDER_HINT}</p>
              <FieldError
                errors={
                  form.formState.errors.messageTemplate
                    ? [form.formState.errors.messageTemplate]
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
          <Button type="submit" form="celebration-type-form" disabled={updateType.isPending}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
