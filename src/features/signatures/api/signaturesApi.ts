import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope, PaginatedEnvelope, PaginationMeta } from '@/core/api/types'
import type {
  CreateSignaturesPayload,
  Signature,
  SignatureFilters,
  SignatureResponseData,
  UpdateSignaturePayload,
} from '@/features/signatures/types'

function mapSignature(s: SignatureResponseData): Signature {
  return {
    id: s.id,
    userId: s.userId,
    nomParoissien: s.nomParoissien,
    churchId: s.churchId,
    monthIndex: s.monthIndex,
    month: s.month,
    year: s.year,
    amount: s.amount,
    fees: s.fees,
    paymentMethod: s.paymentMethod,
    phoneNumber: s.phoneNumber,
    signatureType: s.signatureType as Signature['signatureType'],
    status: s.status as Signature['status'],
    ancienId: s.ancienId,
    ancienNom: s.ancienNom,
    paymentReference: s.payment_reference,
    user: s.user ?? null,
    ancien: s.ancien ?? null,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export interface SignaturesPage {
  signatures: Signature[]
  pagination: PaginationMeta
}

export async function getSignatures(filters: SignatureFilters): Promise<SignaturesPage> {
  const { data } = await httpClient.get<PaginatedEnvelope<SignatureResponseData>>(
    '/admin/signatures',
    {
      params: {
        church_id: filters.churchId,
        month: filters.month,
        year: filters.year,
        type: filters.type,
        status: filters.status,
        search: filters.search === '' ? undefined : filters.search,
        page: filters.page,
        per_page: filters.perPage ?? 20,
      },
    },
  )
  return { signatures: data.data.map(mapSignature), pagination: data.pagination }
}

export async function createSignatures(payload: CreateSignaturesPayload): Promise<Signature[]> {
  const { data } = await httpClient.post<ApiEnvelope<SignatureResponseData[]>>(
    '/admin/signatures',
    payload,
  )
  return data.data.map(mapSignature)
}

export async function updateSignature(
  id: number,
  payload: UpdateSignaturePayload,
): Promise<Signature> {
  const { data } = await httpClient.put<ApiEnvelope<SignatureResponseData>>(
    `/admin/signatures/${id}`,
    payload,
  )
  return mapSignature(data.data)
}

export async function deleteSignature(id: number): Promise<void> {
  await httpClient.delete(`/admin/signatures/${id}`)
}
