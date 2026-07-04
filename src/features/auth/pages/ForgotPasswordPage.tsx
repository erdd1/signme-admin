import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/core/api/errors'
import {
  useConfirmPasswordReset,
  useForgotPassword,
  useResendPasswordResetOtp,
  useVerifyPasswordResetOtp,
} from '@/features/auth/hooks/useForgotPassword'
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
  type OtpFormValues,
  otpSchema,
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/features/auth/schemas'

type Step = 'email' | 'otp' | 'reset'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const navigate = useNavigate()

  const forgotPassword = useForgotPassword()
  const verifyOtp = useVerifyPasswordResetOtp()
  const resendOtp = useResendPasswordResetOtp()
  const confirmReset = useConfirmPasswordReset()

  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  })

  async function onSubmitEmail(values: ForgotPasswordFormValues) {
    try {
      await forgotPassword.mutateAsync(values.email)
      setEmail(values.email)
      setStep('otp')
      toast.info('Si ce compte existe, un code a été envoyé par email.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function onSubmitOtp(values: OtpFormValues) {
    try {
      const token = await verifyOtp.mutateAsync({ email, otp: values.otp })
      setResetToken(token)
      setStep('reset')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Code invalide ou expiré.'))
    }
  }

  async function onSubmitReset(values: ResetPasswordFormValues) {
    try {
      await confirmReset.mutateAsync({ email, resetToken, ...values })
      toast.success('Mot de passe réinitialisé. Veuillez vous reconnecter.')
      void navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function handleResend() {
    try {
      await resendOtp.mutateAsync(email)
      toast.info('Un nouveau code a été envoyé.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          {step === 'email' && 'Entrez votre adresse e-mail pour recevoir un code.'}
          {step === 'otp' && `Entrez le code envoyé à ${email}.`}
          {step === 'reset' && 'Choisissez un nouveau mot de passe.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' && (
          <form onSubmit={(event) => void emailForm.handleSubmit(onSubmitEmail)(event)}>
            <FieldGroup>
              <Field data-invalid={!!emailForm.formState.errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!emailForm.formState.errors.email}
                  {...emailForm.register('email')}
                />
                <FieldError
                  errors={
                    emailForm.formState.errors.email
                      ? [emailForm.formState.errors.email]
                      : undefined
                  }
                />
              </Field>
              <Button type="submit" disabled={emailForm.formState.isSubmitting} className="w-full">
                Envoyer le code
              </Button>
              <Button variant="ghost" className="w-full" render={<Link to="/login" />}>
                Retour à la connexion
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={(event) => void otpForm.handleSubmit(onSubmitOtp)(event)}>
            <FieldGroup>
              <Field data-invalid={!!otpForm.formState.errors.otp}>
                <FieldLabel htmlFor="otp">Code reçu par email</FieldLabel>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
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
                onClick={() => void handleResend()}
                disabled={resendOtp.isPending}
              >
                Renvoyer le code
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={(event) => void resetForm.handleSubmit(onSubmitReset)(event)}>
            <FieldGroup>
              <Field data-invalid={!!resetForm.formState.errors.password}>
                <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!resetForm.formState.errors.password}
                  {...resetForm.register('password')}
                />
                <FieldError
                  errors={
                    resetForm.formState.errors.password
                      ? [resetForm.formState.errors.password]
                      : undefined
                  }
                />
              </Field>
              <Field data-invalid={!!resetForm.formState.errors.passwordConfirmation}>
                <FieldLabel htmlFor="passwordConfirmation">Confirmer le mot de passe</FieldLabel>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!resetForm.formState.errors.passwordConfirmation}
                  {...resetForm.register('passwordConfirmation')}
                />
                <FieldError
                  errors={
                    resetForm.formState.errors.passwordConfirmation
                      ? [resetForm.formState.errors.passwordConfirmation]
                      : undefined
                  }
                />
              </Field>
              <Button type="submit" disabled={resetForm.formState.isSubmitting} className="w-full">
                Réinitialiser le mot de passe
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
