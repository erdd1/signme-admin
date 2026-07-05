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
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'
import { useUpdateSignature } from '@/features/signatures/hooks/useUpdateSignature'
import {
  type UpdateSignatureFormValues,
  updateSignatureSchema,
} from '@/features/signatures/schemas'
import { type Signature, SIGNATURE_STATUSES } from '@/features/signatures/types'

interface EditSignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  signature: Signature | undefined
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
}

function toFormDefaults(signature?: Signature): UpdateSignatureFormValues {
  return {
    status: signature?.status ?? 'pending',
    amount: signature?.amount ?? 0,
    fees: signature?.fees ?? 0,
  }
}

export function EditSignatureDialog({ open, onOpenChange, signature }: EditSignatureDialogProps) {
  const updateSignature = useUpdateSignature()

  const form = useForm<UpdateSignatureFormValues>({
    resolver: zodResolver(updateSignatureSchema),
    defaultValues: toFormDefaults(signature),
  })

  useEffect(() => {
    if (open) form.reset(toFormDefaults(signature))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, signature])

  async function onSubmit(values: UpdateSignatureFormValues) {
    if (!signature) return
    try {
      await updateSignature.mutateAsync({ id: signature.id, payload: values })
      toast.success('Signature mise à jour avec succès.')
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
          <DialogTitle>Modifier la signature</DialogTitle>
          <DialogDescription>
            {signature?.nomParoissien} — {signature?.month}
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-signature-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid gap-4">
            <Field data-invalid={!!form.formState.errors.status}>
              <FieldLabel>Statut</FieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{(value: string) => STATUS_LABELS[value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SIGNATURE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.amount}>
              <FieldLabel htmlFor="amount">Montant (FCFA)</FieldLabel>
              <Input
                id="amount"
                type="number"
                {...form.register('amount', { valueAsNumber: true })}
              />
              <FieldError
                errors={form.formState.errors.amount ? [form.formState.errors.amount] : undefined}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.fees}>
              <FieldLabel htmlFor="fees">Frais (FCFA)</FieldLabel>
              <Input id="fees" type="number" {...form.register('fees', { valueAsNumber: true })} />
              <FieldError
                errors={form.formState.errors.fees ? [form.formState.errors.fees] : undefined}
              />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="edit-signature-form" disabled={updateSignature.isPending}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
