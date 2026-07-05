export type ContributionStatus = 'pending' | 'completed' | 'failed'

export interface ContributionPayment {
  uuid: string
  montant: number
  frais: number
  montantTotal: number
  statut: ContributionStatus
  note: string | null
  paymentOperator: string | null
  paymentNumber: string | null
  paymentMethod: string
  paymentReference: string | null
  authorizationUrl: string | null
  contributeur: {
    id: number
    nom: string
    groupe: { id: number; nom: string } | null
  } | null
  evenement: {
    uuid: string
    titre: string
  }
  createdAt: string
}
