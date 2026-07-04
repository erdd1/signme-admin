import { AxiosError } from 'axios'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

interface ApiErrorBody {
  success: false
  message: string
  errors?: Record<string, unknown>
}

function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!(error instanceof AxiosError)) return undefined
  return error.response?.data as ApiErrorBody | undefined
}

export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  return getApiErrorBody(error)?.message ?? fallback
}

export function isMfaRequiredError(error: unknown): boolean {
  return getApiErrorBody(error)?.errors?.mfa_required === true
}

export function isMfaSetupRequiredError(error: unknown): boolean {
  return getApiErrorBody(error)?.errors?.mfa_setup_required === true
}

/**
 * Mappe les erreurs de validation 422 du backend (`errors.{champ}: string[]`)
 * sur les champs react-hook-form correspondants via `setError`.
 * `fieldMap` permet de traduire un nom de champ serveur (snake_case) vers le
 * nom du champ dans le formulaire (ex: `current_password` -> `currentPassword`).
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
  fieldMap: Partial<Record<string, Path<T>>> = {},
): boolean {
  if (!(error instanceof AxiosError) || error.response?.status !== 422) return false

  const body = getApiErrorBody(error)
  if (!body?.errors) return false

  let applied = false
  for (const [serverField, messages] of Object.entries(body.errors)) {
    if (!Array.isArray(messages) || messages.length === 0) continue
    const field = fieldMap[serverField] ?? (serverField as Path<T>)
    form.setError(field, { type: 'server', message: String(messages[0]) })
    applied = true
  }
  return applied
}
