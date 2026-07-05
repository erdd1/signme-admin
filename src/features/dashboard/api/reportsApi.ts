import { httpClient } from '@/core/api/httpClient'
import type { ApiEnvelope } from '@/core/api/types'
import type {
  AnnualFinanceReport,
  AnnualFinanceReportResponseData,
  ComparisonReport,
  ComparisonReportResponseData,
  MemberReportEntry,
  MemberReportResponseEntry,
  MemberSignatureSummary,
  SecretaryReport,
  SecretaryReportResponseData,
} from '@/features/dashboard/types'

function mapMemberReportEntry(m: MemberReportResponseEntry): MemberReportEntry {
  return {
    ...m,
    signature: m.signature
      ? {
          ...m.signature,
          signatureType: m.signature.signatureType as MemberSignatureSummary['signatureType'],
        }
      : undefined,
  }
}

function mapSecretaryReport(r: SecretaryReportResponseData): SecretaryReport {
  return {
    month: r.month,
    churchId: r.eglise_id,
    totalMembres: r.total_membres,
    totalSignes: r.total_signes,
    totalNonSignes: r.total_non_signes,
    tauxSignature: r.taux_signature,
    montantCollecte: r.montant_collecte,
    signes: r.signes.map(mapMemberReportEntry),
    nonSignes: r.non_signes.map(mapMemberReportEntry),
  }
}

export async function getSecretaryReport(
  month: string,
  churchId: number,
): Promise<SecretaryReport> {
  const { data } = await httpClient.get<ApiEnvelope<SecretaryReportResponseData>>(
    '/admin/rapports/secretaire',
    { params: { month, church_id: churchId } },
  )
  return mapSecretaryReport(data.data)
}

function mapAnnualFinanceReport(r: AnnualFinanceReportResponseData): AnnualFinanceReport {
  return {
    year: r.year,
    churchId: r.eglise_id,
    mois: r.mois.map((m) => ({
      monthIndex: m.monthIndex,
      monthName: m.monthName,
      month: m.month,
      nbSignatures: m.nb_signatures,
      totalOffrandes: m.total_offrandes,
      totalFrais: m.total_frais,
      totalEncaisse: m.total_encaisse,
      montantPresentiel: m.montant_presentiel,
      montantDistance: m.montant_distance,
      nbPresentiel: m.nb_presentiel,
      nbDistance: m.nb_distance,
    })),
    totauxAnnuels: {
      nbSignatures: r.totaux_annuels.nb_signatures,
      totalOffrandes: r.totaux_annuels.total_offrandes,
      totalFrais: r.totaux_annuels.total_frais,
      totalEncaisse: r.totaux_annuels.total_encaisse,
    },
  }
}

export async function getAnnualFinanceReport(
  year: number,
  churchId: number,
): Promise<AnnualFinanceReport> {
  const { data } = await httpClient.get<ApiEnvelope<AnnualFinanceReportResponseData>>(
    '/admin/rapports/finances/annuel',
    { params: { year, church_id: churchId } },
  )
  return mapAnnualFinanceReport(data.data)
}

function mapComparisonReport(r: ComparisonReportResponseData): ComparisonReport {
  return {
    churchId: r.eglise_id,
    current: r.current,
    previous: r.previous,
    evolutionPourcentage: r.evolution.pourcentage,
    evolutionSens: r.evolution.sens as ComparisonReport['evolutionSens'],
    evolutionDifference: r.evolution.difference,
  }
}

export async function getComparisonReport(churchId: number): Promise<ComparisonReport> {
  const { data } = await httpClient.get<ApiEnvelope<ComparisonReportResponseData>>(
    '/admin/rapports/comparaison',
    { params: { church_id: churchId } },
  )
  return mapComparisonReport(data.data)
}
