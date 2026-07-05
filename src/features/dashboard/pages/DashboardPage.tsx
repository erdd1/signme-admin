import { TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnnualFinanceReport } from '@/features/dashboard/hooks/useAnnualFinanceReport'
import { useComparisonReport } from '@/features/dashboard/hooks/useComparisonReport'
import { useSecretaryReport } from '@/features/dashboard/hooks/useSecretaryReport'
import { useChurches } from '@/features/users/hooks/useChurches'

const ALL = '__all__'

const chartConfig = {
  montantPresentiel: { label: 'Présentiel', color: 'var(--chart-1)' },
  montantDistance: { label: 'Distance', color: 'var(--chart-2)' },
} satisfies ChartConfig

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function DashboardPage() {
  const churches = useChurches()
  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [month, setMonth] = useState(currentMonthKey())

  const year = Number(month.split('-')[0])

  const secretary = useSecretaryReport(month, churchId)
  const annual = useAnnualFinanceReport(year, churchId)
  const comparison = useComparisonReport(churchId)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Select
            value={churchId ? String(churchId) : ALL}
            onValueChange={(value) => setChurchId(value === ALL ? undefined : Number(value))}
          >
            <SelectTrigger className="w-64">
              <SelectValue>
                {(value: string) =>
                  value === ALL
                    ? 'Choisir une église'
                    : (churches.data?.find((c) => String(c.id) === value)?.nom ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Choisir une église</SelectItem>
              {churches.data?.map((church) => (
                <SelectItem key={church.id} value={String(church.id)}>
                  {church.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="w-40"
          />
        </CardContent>
      </Card>

      {!churchId && (
        <p className="text-muted-foreground text-sm">
          Sélectionnez une église pour voir ses statistiques.
        </p>
      )}

      {churchId && (
        <>
          {secretary.isLoading && <Skeleton className="h-24 w-full" />}
          {secretary.data && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Membres" value={secretary.data.totalMembres} />
              <StatCard label="Signés ce mois" value={secretary.data.totalSignes} />
              <StatCard label="Non signés" value={secretary.data.totalNonSignes} />
              <StatCard label="Taux de signature" value={`${secretary.data.tauxSignature}%`} />
              <StatCard label="Montant collecté" value={`${secretary.data.montantCollecte} FCFA`} />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Évolution annuelle</CardTitle>
              <CardDescription>
                Comparaison avec l'année précédente (offrandes complétées).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparison.isLoading && <Skeleton className="h-16 w-full" />}
              {comparison.data && (
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-muted-foreground text-xs">{comparison.data.current.year}</p>
                    <p className="text-xl font-semibold">{comparison.data.current.total} FCFA</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{comparison.data.previous.year}</p>
                    <p className="text-xl font-semibold">{comparison.data.previous.total} FCFA</p>
                  </div>
                  <Badge
                    variant={
                      comparison.data.evolutionSens === 'hausse'
                        ? 'default'
                        : comparison.data.evolutionSens === 'baisse'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="gap-1"
                  >
                    {comparison.data.evolutionSens === 'hausse' && (
                      <TrendingUp className="size-3" />
                    )}
                    {comparison.data.evolutionSens === 'baisse' && (
                      <TrendingDown className="size-3" />
                    )}
                    {comparison.data.evolutionPourcentage}%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Offrandes par mois — {year}</CardTitle>
              <CardDescription>Répartition présentiel / distance.</CardDescription>
            </CardHeader>
            <CardContent>
              {annual.isLoading && <Skeleton className="h-64 w-full" />}
              {annual.data && (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <BarChart data={annual.data.mois}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="monthName" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="montantPresentiel"
                      stackId="a"
                      fill="var(--color-montantPresentiel)"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="montantDistance"
                      stackId="a"
                      fill="var(--color-montantDistance)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membres n'ayant pas signé — {month}</CardTitle>
              <CardDescription>
                {secretary.data?.nonSignes.length ?? 0} membre(s) sans signature ce mois.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {secretary.data && secretary.data.nonSignes.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Tous les membres ont signé pour ce mois.
                </p>
              )}
              {secretary.data && secretary.data.nonSignes.length > 0 && (
                <ul className="divide-y rounded-md border">
                  {secretary.data.nonSignes.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">{member.nom}</div>
                        <div className="text-muted-foreground text-xs">{member.email}</div>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
