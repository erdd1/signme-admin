export type PaymentEventType =
  | 'created'
  | 'sent_to_gateway'
  | 'webhook_received'
  | 'confirmed'
  | 'failed'
  | 'expired'
  | 'manual_recheck'

/** Historique MÉTIER permanent (payment_events) */
export interface PaymentEvent {
  id: number
  eventType: PaymentEventType
  resultingStatus: string
  rawPayload: Record<string, unknown> | null
  triggeredByAdmin: { id: number; nom: string } | null
  sourceIp: string | null
  createdAt: string
}

/** Diagnostic TECHNIQUE verbeux, purgé après 7 jours (payment_sync_logs) */
export interface PaymentSyncLog {
  id: number
  checkedAt: string
  resultingStatus: string
  rawPayload: Record<string, unknown> | null
  createdAt: string
}

/** Vue détaillée admin (11 champs) — signature ET contribution partagent ce format */
export interface PaymentDetail {
  id: number
  referenceInterne: string
  referenceNotchPay: string | null
  transactionIdGateway: string | null
  createdAt: string | null
  confirmedAt: string | null
  paymentMethod: string
  paymentOperator: string | null
  paymentNumberMasked: string | null
  fees: number
  totalAmount: number
  amountCharged: number
  netAmount: number
  status: string
  lastWebhookPayload: Record<string, unknown> | null
}
