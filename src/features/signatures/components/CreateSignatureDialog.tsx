import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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
import { useCreateSignatures } from '@/features/signatures/hooks/useCreateSignatures'
import {
  type CreateSignaturesFormValues,
  createSignaturesSchema,
} from '@/features/signatures/schemas'
import { useUsers } from '@/features/users/hooks/useUsers'

interface CreateSignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSignatureDialog({ open, onOpenChange }: CreateSignatureDialogProps) {
  const createSignatures = useCreateSignatures()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedUserLabel, setSelectedUserLabel] = useState('')
  const [monthInput, setMonthInput] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const userResults = useUsers({ search: debouncedSearch || undefined, perPage: 8, page: 1 })

  const form = useForm<CreateSignaturesFormValues>({
    resolver: zodResolver(createSignaturesSchema),
    defaultValues: { userId: undefined as unknown as number, months: [], amount: 1000 },
  })

  useEffect(() => {
    if (open) {
      form.reset({ userId: undefined as unknown as number, months: [], amount: 1000 })
      setSearch('')
      setSelectedUserLabel('')
      setMonthInput('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const months = form.watch('months')
  const userId = form.watch('userId')

  function addMonth() {
    if (!monthInput || months.includes(monthInput)) return
    form.setValue('months', [...months, monthInput].sort(), { shouldValidate: true })
    setMonthInput('')
  }

  function removeMonth(month: string) {
    form.setValue(
      'months',
      months.filter((m) => m !== month),
      { shouldValidate: true },
    )
  }

  function selectUser(id: number, label: string) {
    form.setValue('userId', id, { shouldValidate: true })
    setSelectedUserLabel(label)
    setSearch('')
  }

  function clearUser() {
    form.setValue('userId', undefined as unknown as number)
    setSelectedUserLabel('')
  }

  async function onSubmit(values: CreateSignaturesFormValues) {
    try {
      const created = await createSignatures.mutateAsync(values)
      toast.success(`${created.length} signature(s) créée(s) avec succès.`)
      onOpenChange(false)
    } catch (error) {
      const applied = applyServerErrors(error, form)
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle signature</DialogTitle>
          <DialogDescription>
            Crée une ou plusieurs signatures déjà complétées, pour un paiement effectué hors-système
            (espèces).
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-signature-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid gap-4">
            <Field data-invalid={!!form.formState.errors.userId}>
              <FieldLabel>Paroissien</FieldLabel>
              {userId && selectedUserLabel ? (
                <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{selectedUserLabel}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={clearUser}>
                    Changer
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Rechercher un paroissien (nom, email)..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {debouncedSearch && userResults.data && (
                    <div className="max-h-40 overflow-y-auto rounded-md border">
                      {userResults.data.users.length === 0 && (
                        <p className="text-muted-foreground p-2 text-sm">Aucun résultat.</p>
                      )}
                      {userResults.data.users.map((u) => (
                        <button
                          type="button"
                          key={u.id}
                          className="hover:bg-muted flex w-full flex-col items-start px-2 py-1.5 text-left text-sm"
                          onClick={() => selectUser(u.id, `${u.nom} (${u.email})`)}
                        >
                          <span className="font-medium">{u.nom}</span>
                          <span className="text-muted-foreground text-xs">{u.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <FieldError
                errors={form.formState.errors.userId ? [form.formState.errors.userId] : undefined}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.months}>
              <FieldLabel htmlFor="month-input">Mois</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="month-input"
                  type="month"
                  value={monthInput}
                  onChange={(event) => setMonthInput(event.target.value)}
                />
                <Button type="button" variant="outline" onClick={addMonth} disabled={!monthInput}>
                  <Plus /> Ajouter
                </Button>
              </div>
              {months.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {months.map((month) => (
                    <Badge key={month} variant="secondary" className="gap-1">
                      {month}
                      <button type="button" onClick={() => removeMonth(month)}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FieldError
                errors={form.formState.errors.months ? [form.formState.errors.months] : undefined}
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.amount}>
              <FieldLabel htmlFor="amount">Montant par mois (FCFA)</FieldLabel>
              <Input
                id="amount"
                type="number"
                {...form.register('amount', { valueAsNumber: true })}
              />
              <FieldError
                errors={form.formState.errors.amount ? [form.formState.errors.amount] : undefined}
              />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="create-signature-form" disabled={createSignatures.isPending}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
