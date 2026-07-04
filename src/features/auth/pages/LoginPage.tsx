import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // TODO(module Auth) : brancher POST /v1/auth/login puis
  // useAuthStore.getState().setSession(...) avec la réponse du backend.
  function onSubmit(values: LoginFormValues) {
    toast.info(`Authentification à implémenter pour ${values.email}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion administrateur</CardTitle>
        <CardDescription>Accès réservé aux administrateurs SignMe.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.email}
                {...form.register('email')}
              />
              <FieldError
                errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
              />
            </Field>
            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register('password')}
              />
              <FieldError
                errors={
                  form.formState.errors.password ? [form.formState.errors.password] : undefined
                }
              />
            </Field>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              Se connecter
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
