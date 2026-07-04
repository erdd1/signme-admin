import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_APP_NAME: z.string().min(1),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(`Configuration d'environnement invalide :\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data
