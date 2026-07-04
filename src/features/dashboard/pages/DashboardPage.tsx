import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const placeholderStats = [
  { label: 'Membres', value: '—' },
  { label: 'Signatures ce mois', value: '—' },
  { label: 'Paiements en attente', value: '—' },
]

const placeholderChartData = [
  { month: 'Jan', signatures: 0 },
  { month: 'Fév', signatures: 0 },
  { month: 'Mar', signatures: 0 },
  { month: 'Avr', signatures: 0 },
]

const chartConfig = {
  signatures: { label: 'Signatures', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <Badge variant="outline">Exemple — module Statistiques à venir</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {placeholderStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signatures par mois</CardTitle>
          <CardDescription>
            Données factices — à remplacer par le module Statistiques.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={placeholderChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="signatures" fill="var(--color-signatures)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
