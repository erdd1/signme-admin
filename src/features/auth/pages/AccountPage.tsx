import { zodResolver } from '@hookform/resolvers/zod'
import { Laptop, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { applyServerErrors, getApiErrorMessage } from '@/core/api/errors'
import { useChangePassword } from '@/features/auth/hooks/useChangePassword'
import { useDevices, useDisconnectDevice } from '@/features/auth/hooks/useDevices'
import { useDisableMfa, useMfaStatus } from '@/features/auth/hooks/useMfa'
import { type ChangePasswordFormValues, changePasswordSchema } from '@/features/auth/schemas'
import { useAuthStore } from '@/features/auth/store/authStore'

function ProfileSummary() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Informations de votre compte administrateur.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <span className="text-muted-foreground">Nom : </span>
          {user.nom}
        </div>
        <div>
          <span className="text-muted-foreground">Email : </span>
          {user.email}
        </div>
        <div>
          <span className="text-muted-foreground">Rôle : </span>
          {user.role}
        </div>
        <div>
          <span className="text-muted-foreground">Église : </span>
          {user.church?.nom ?? '—'}
        </div>
      </CardContent>
    </Card>
  )
}

function ChangePasswordCard() {
  const changePassword = useChangePassword()
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', passwordConfirmation: '' },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await changePassword.mutateAsync(values)
      toast.success('Mot de passe modifié avec succès.')
      form.reset()
    } catch (error) {
      const applied = applyServerErrors(error, form, {
        current_password: 'currentPassword',
        password_confirmation: 'passwordConfirmation',
      })
      if (!applied) toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">Mot de passe actuel</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...form.register('currentPassword')}
              />
              <FieldError
                errors={
                  form.formState.errors.currentPassword
                    ? [form.formState.errors.currentPassword]
                    : undefined
                }
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('password')}
              />
              <FieldError
                errors={
                  form.formState.errors.password ? [form.formState.errors.password] : undefined
                }
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.passwordConfirmation}>
              <FieldLabel htmlFor="passwordConfirmation">Confirmer</FieldLabel>
              <Input
                id="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                {...form.register('passwordConfirmation')}
              />
              <FieldError
                errors={
                  form.formState.errors.passwordConfirmation
                    ? [form.formState.errors.passwordConfirmation]
                    : undefined
                }
              />
            </Field>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Mettre à jour
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function MfaCard() {
  const mfaStatus = useMfaStatus()
  const disableMfa = useDisableMfa()

  async function handleDisable() {
    try {
      await disableMfa.mutateAsync()
      toast.success('MFA désactivé.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentification à deux facteurs</CardTitle>
        <CardDescription>Obligatoire pour les comptes administrateur.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {mfaStatus.isLoading && <Skeleton className="h-6 w-40" />}
        {mfaStatus.data && (
          <>
            <div className="flex items-center gap-2">
              {mfaStatus.data.enabled ? (
                <Badge>
                  <ShieldCheck /> Activé ({mfaStatus.data.backupCodesRemaining} codes de secours
                  restants)
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <ShieldOff /> Non configuré
                </Badge>
              )}
            </div>
            {mfaStatus.data.enabled ? (
              <Button
                variant="outline"
                onClick={() => void handleDisable()}
                disabled={disableMfa.isPending}
              >
                Désactiver
              </Button>
            ) : (
              <Button render={<Link to="/mfa-setup" />}>Configurer</Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DevicesCard() {
  const devices = useDevices()
  const disconnectDevice = useDisconnectDevice()

  async function handleDisconnect(id: number) {
    try {
      await disconnectDevice.mutateAsync(id)
      toast.success('Appareil déconnecté.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes appareils</CardTitle>
        <CardDescription>Sessions actives sur votre compte.</CardDescription>
      </CardHeader>
      <CardContent>
        {devices.isLoading && <Skeleton className="h-24 w-full" />}
        {devices.data && devices.data.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucun appareil enregistré.</p>
        )}
        {devices.data && devices.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appareil</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.data.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="flex items-center gap-2">
                    {device.deviceType === 'mobile' ? (
                      <Smartphone className="size-4" />
                    ) : (
                      <Laptop className="size-4" />
                    )}
                    {device.name}
                  </TableCell>
                  <TableCell>{device.ipAddress ?? '—'}</TableCell>
                  <TableCell>{new Date(device.lastActivity).toLocaleString('fr-FR')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDisconnect(device.id)}
                      disabled={disconnectDevice.isPending}
                    >
                      Déconnecter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mon compte</h1>
      <ProfileSummary />
      <ChangePasswordCard />
      <MfaCard />
      <DevicesCard />
    </div>
  )
}
