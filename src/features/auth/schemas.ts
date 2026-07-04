import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres'),
})
export type OtpFormValues = z.infer<typeof otpSchema>

/**
 * Au login, le champ OTP accepte un code à 6 chiffres OU un code de secours
 * (8 caractères hexadécimaux majuscules) — voir LoginRequest.php.
 */
export const loginOtpSchema = z.object({
  otp: z.string().regex(/^(\d{6}|[0-9A-F]{8})$/, 'Code invalide (6 chiffres ou code de secours)'),
})
export type LoginOtpFormValues = z.infer<typeof loginOtpSchema>

/**
 * Miroir exact de App\Core\Rules\StrongPasswordRule.php : 10 à 30 caractères,
 * au moins une majuscule, une minuscule, un chiffre et un caractère spécial
 * parmi ! @ # $ % ^ & * ?, aucun espace.
 */
export const strongPasswordSchema = z
  .string()
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*?])\S{10,30}$/,
    '10 à 30 caractères, avec majuscule, minuscule, chiffre et caractère spécial (! @ # $ % ^ & * ?)',
  )

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est obligatoire'),
    password: strongPasswordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirmation'],
  })
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export const forgotPasswordSchema = z.object({
  email: z.email('Adresse e-mail invalide'),
})
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirmation'],
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
