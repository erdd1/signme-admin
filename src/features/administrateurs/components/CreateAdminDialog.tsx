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
import { useCreateAdmin } from '@/features/administrateurs/hooks/useCreateAdmin'
import { type CreateAdminFormValues, createAdminSchema } from '@/features/administrateurs/schemas'

interface CreateAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAdminDialog({ open, onOpenChange }: CreateAdminDialogProps) {
  const createAdmin = useCreateAdmin()

  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { nom: '', email: '', password: '' },
  })

  useEffect(() => {
    if (open) form.reset({ nom: '', email: '', password: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(values: CreateAdminFormValues) {
    try {
      await createAdmin.mutateAsync(values)
      toast.success(
        "Administrateur créé — il n'a pour l'instant accès à aucun module, configurez ses permissions.",
      )
      onOpenChange(false)
    } catch (error) {
      const applied = applyServerErrors(error, form)
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel administrateur</DialogTitle>
          <DialogDescription>
            Créé sans aucune permission par défaut — vous les configurerez juste après.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-admin-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid gap-4">
            <Field data-invalid={!!form.formState.errors.nom}>
              <FieldLabel htmlFor="admin-nom">Nom</FieldLabel>
              <Input id="admin-nom" {...form.register('nom')} />
              <FieldError
                errors={form.formState.errors.nom ? [form.formState.errors.nom] : undefined}
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="admin-email">Email</FieldLabel>
              <Input id="admin-email" type="email" {...form.register('email')} />
              <FieldError
                errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="admin-password">Mot de passe</FieldLabel>
              <Input id="admin-password" type="password" {...form.register('password')} />
              <FieldError
                errors={
                  form.formState.errors.password ? [form.formState.errors.password] : undefined
                }
              />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="create-admin-form" disabled={createAdmin.isPending}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
