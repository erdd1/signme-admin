import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'
import { useDesignerAncien } from '@/features/anciens-designations/hooks/useDesignerAncien'
import type { DesignerAncienFormValues } from '@/features/anciens-designations/schemas'
import { designerAncienSchema } from '@/features/anciens-designations/schemas'
import type { AncienNonDesigne } from '@/features/anciens-designations/types'
import { JOURS_SEMAINE } from '@/features/anciens-designations/types'

interface DesignerAncienDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ancien: AncienNonDesigne | undefined
  mois: number
  annee: number
  churchId: number | undefined
}

export function DesignerAncienDialog({
  open,
  onOpenChange,
  ancien,
  mois,
  annee,
  churchId,
}: DesignerAncienDialogProps) {
  const designerAncien = useDesignerAncien()

  const form = useForm<DesignerAncienFormValues>({
    resolver: zodResolver(designerAncienSchema),
    defaultValues: { joursTravail: [], horaireDebut: undefined, horaireFin: undefined },
  })

  useEffect(() => {
    if (open) form.reset({ joursTravail: [], horaireDebut: undefined, horaireFin: undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ancien])

  const joursTravail = form.watch('joursTravail')

  function toggleJour(jour: number, checked: boolean) {
    const current = form.getValues('joursTravail')
    form.setValue('joursTravail', checked ? [...current, jour] : current.filter((j) => j !== jour))
  }

  async function onSubmit(values: DesignerAncienFormValues) {
    if (!ancien || !churchId) return
    try {
      await designerAncien.mutateAsync({
        ancien_id: ancien.id,
        mois,
        annee,
        church_id: churchId,
        jours_travail: values.joursTravail.length > 0 ? values.joursTravail : undefined,
        horaire_debut: values.horaireDebut,
        horaire_fin: values.horaireFin,
      })
      toast.success('Ancien désigné de service avec succès.')
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
          <DialogTitle>Désigner {ancien?.nom}</DialogTitle>
          <DialogDescription>
            Choisissez les jours et horaires de disponibilité, ou laissez tout vide pour un accès
            24/7 sans restriction.
          </DialogDescription>
        </DialogHeader>

        <form
          id="designer-ancien-form"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          className="grid gap-4"
        >
          <FieldGroup className="grid gap-4">
            <Field>
              <FieldLabel>Jours de travail</FieldLabel>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {JOURS_SEMAINE.map((jour) => (
                  <label key={jour.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={joursTravail.includes(jour.value)}
                      onCheckedChange={(checked) => toggleJour(jour.value, checked === true)}
                    />
                    {jour.label}
                  </label>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Laissez tous les jours décochés pour un accès 24/7 sans restriction.
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!form.formState.errors.horaireDebut}>
                <FieldLabel htmlFor="horaireDebut">Horaire début</FieldLabel>
                <Input id="horaireDebut" type="time" {...form.register('horaireDebut')} />
                <FieldError
                  errors={
                    form.formState.errors.horaireDebut
                      ? [form.formState.errors.horaireDebut]
                      : undefined
                  }
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.horaireFin}>
                <FieldLabel htmlFor="horaireFin">Horaire fin</FieldLabel>
                <Input id="horaireFin" type="time" {...form.register('horaireFin')} />
                <FieldError
                  errors={
                    form.formState.errors.horaireFin
                      ? [form.formState.errors.horaireFin]
                      : undefined
                  }
                />
              </Field>
            </div>
            <p className="text-muted-foreground -mt-2 text-xs">
              Laissez vide pour aucune restriction d'horaire.
            </p>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="designer-ancien-form" disabled={designerAncien.isPending}>
            Désigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
