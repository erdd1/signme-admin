import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Copy, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/core/api/errors'
import { useConfirmMfa, useEnableMfa } from '@/features/auth/hooks/useMfa'
import { type OtpFormValues, otpSchema } from '@/features/auth/schemas'
import { useAuthStore } from '@/features/auth/store/authStore'

type Step = 'intro' | 'backup-codes' | 'confirm'

export function MfaSetupPage() {
  const [step, setStep] = useState<Step>('intro')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [codesSaved, setCodesSaved] = useState(false)

  const enableMfa = useEnableMfa()
  const confirmMfa = useConfirmMfa()
  const setMfaSetupRequired = useAuthStore((state) => state.setMfaSetupRequired)
  const navigate = useNavigate()

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  async function handleEnable() {
    try {
      const result = await enableMfa.mutateAsync()
      setBackupCodes(result.backupCodes)
      setStep('backup-codes')
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'activer le MFA."))
    }
  }

  function handleCopyBackupCodes() {
    void navigator.clipboard.writeText(backupCodes.join('\n'))
    toast.success('Codes de secours copiés.')
  }

  async function onSubmitOtp(values: OtpFormValues) {
    try {
      await confirmMfa.mutateAsync(values.otp)
      setMfaSetupRequired(false)
      toast.success('Authentification à deux facteurs activée.')
      void navigate('/', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Code OTP invalide ou expiré.'))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-5" />
          <CardTitle>Configuration obligatoire du MFA</CardTitle>
        </div>
        <CardDescription>
          Le dashboard administrateur exige une authentification à deux facteurs. Vous devez la
          configurer avant de continuer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'intro' && (
          <FieldGroup>
            <p className="text-muted-foreground text-sm">
              Un code de vérification vous sera envoyé par email à chaque connexion. Cliquez
              ci-dessous pour commencer.
            </p>
            <Button
              onClick={() => void handleEnable()}
              disabled={enableMfa.isPending}
              className="w-full"
            >
              Activer le MFA
            </Button>
          </FieldGroup>
        )}

        {step === 'backup-codes' && (
          <FieldGroup>
            <p className="text-sm">
              Notez ces codes de secours dans un endroit sûr. Chacun ne peut être utilisé qu'une
              seule fois si vous perdez l'accès à votre email.
            </p>
            <div className="bg-muted grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm">
              {backupCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyBackupCodes}
              className="w-full"
            >
              <Copy /> Copier les codes
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={codesSaved}
                onChange={(event) => setCodesSaved(event.target.checked)}
              />
              J'ai noté mes codes de secours
            </label>
            <Button
              type="button"
              disabled={!codesSaved}
              onClick={() => setStep('confirm')}
              className="w-full"
            >
              <CheckCircle2 /> Continuer
            </Button>
          </FieldGroup>
        )}

        {step === 'confirm' && (
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
                Confirmer
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => void handleEnable()}
                disabled={enableMfa.isPending}
              >
                Renvoyer le code
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
