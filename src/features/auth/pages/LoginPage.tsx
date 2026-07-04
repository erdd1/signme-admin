import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage, isMfaRequiredError } from '@/core/api/errors'
import { useLogin } from '@/features/auth/hooks/useLogin'
import {
  type LoginFormValues,
  type LoginOtpFormValues,
  loginOtpSchema,
  loginSchema,
} from '@/features/auth/schemas'
import { useAuthStore } from '@/features/auth/store/authStore'

export function LoginPage() {
  const [credentials, setCredentials] = useState<LoginFormValues | null>(null)
  const login = useLogin()
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  const credentialsForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const otpForm = useForm<LoginOtpFormValues>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: { otp: '' },
  })

  async function attemptLogin(values: LoginFormValues, otp?: string) {
    try {
      const session = await login.mutateAsync({ ...values, otp })
      setSession(session)
      void navigate(session.mfaSetupRequired ? '/mfa-setup' : '/', { replace: true })
    } catch (error) {
      if (isMfaRequiredError(error)) {
        setCredentials(values)
        return
      }
      toast.error(getApiErrorMessage(error, 'Échec de la connexion.'))
    }
  }

  function onSubmitCredentials(values: LoginFormValues) {
    void attemptLogin(values)
  }

  function onSubmitOtp(values: LoginOtpFormValues) {
    if (!credentials) return
    void attemptLogin(credentials, values.otp)
  }

  if (credentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification en deux étapes</CardTitle>
          <CardDescription>
            Entrez le code à 6 chiffres envoyé à {credentials.email}, ou l&apos;un de vos codes de
            secours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void otpForm.handleSubmit(onSubmitOtp)(event)}>
            <FieldGroup>
              <Field data-invalid={!!otpForm.formState.errors.otp}>
                <FieldLabel htmlFor="otp">Code de vérification</FieldLabel>
                <Input
                  id="otp"
                  autoComplete="one-time-code"
                  maxLength={8}
                  aria-invalid={!!otpForm.formState.errors.otp}
                  {...otpForm.register('otp')}
                />
                <FieldError
                  errors={otpForm.formState.errors.otp ? [otpForm.formState.errors.otp] : undefined}
                />
              </Field>
              <Button type="submit" disabled={otpForm.formState.isSubmitting} className="w-full">
                Vérifier
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setCredentials(null)}
              >
                Retour
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion administrateur</CardTitle>
        <CardDescription>Accès réservé aux administrateurs SignMe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void credentialsForm.handleSubmit(onSubmitCredentials)(event)}>
          <FieldGroup>
            <Field data-invalid={!!credentialsForm.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!credentialsForm.formState.errors.email}
                {...credentialsForm.register('email')}
              />
              <FieldError
                errors={
                  credentialsForm.formState.errors.email
                    ? [credentialsForm.formState.errors.email]
                    : undefined
                }
              />
            </Field>
            <Field data-invalid={!!credentialsForm.formState.errors.password}>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!credentialsForm.formState.errors.password}
                {...credentialsForm.register('password')}
              />
              <FieldError
                errors={
                  credentialsForm.formState.errors.password
                    ? [credentialsForm.formState.errors.password]
                    : undefined
                }
              />
              <FieldDescription>
                <Link
                  to="/forgot-password"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  Mot de passe oublié ?
                </Link>
              </FieldDescription>
            </Field>
            <Button
              type="submit"
              disabled={credentialsForm.formState.isSubmitting}
              className="w-full"
            >
              Se connecter
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
