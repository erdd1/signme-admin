import { MoreHorizontal, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateSignatureDialog } from '@/features/signatures/components/CreateSignatureDialog'
import { DeleteSignatureDialog } from '@/features/signatures/components/DeleteSignatureDialog'
import { EditSignatureDialog } from '@/features/signatures/components/EditSignatureDialog'
import { SignatureStatusBadge } from '@/features/signatures/components/SignatureStatusBadge'
import { useSignatures } from '@/features/signatures/hooks/useSignatures'
import {
  type Signature,
  SIGNATURE_STATUSES,
  SIGNATURE_TYPES,
  type SignatureStatus,
  type SignatureType,
} from '@/features/signatures/types'
import { useChurches } from '@/features/users/hooks/useChurches'

const ALL = '__all__'

const STATUS_LABELS: Record<SignatureStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
}

export function SignaturesListPage() {
  const churches = useChurches()

  const [churchId, setChurchId] = useState<number | undefined>(undefined)
  const [type, setType] = useState<SignatureType | typeof ALL>(ALL)
  const [status, setStatus] = useState<SignatureStatus | typeof ALL>(ALL)
  const [month, setMonth] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  const filters = {
    churchId,
    type: type === ALL ? undefined : type,
    status: status === ALL ? undefined : status,
    month: month || undefined,
    search: debouncedSearch || undefined,
    page,
    perPage: 20,
  }

  const signatures = useSignatures(filters)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingSignature, setEditingSignature] = useState<Signature | undefined>(undefined)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingSignature, setDeletingSignature] = useState<Signature | undefined>(undefined)

  function openEdit(signature: Signature) {
    setEditingSignature(signature)
    setEditOpen(true)
  }

  function openDelete(signature: Signature) {
    setDeletingSignature(signature)
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Signatures</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nouvelle signature
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Input
            placeholder="Rechercher (nom du paroissien)..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="max-w-xs"
          />
          <Select
            value={churchId ? String(churchId) : ALL}
            onValueChange={(value) => {
              setChurchId(value === ALL ? undefined : Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {(value: string) =>
                  value === ALL
                    ? 'Toutes les églises'
                    : (churches.data?.find((c) => String(c.id) === value)?.nom ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les églises</SelectItem>
              {churches.data?.map((church) => (
                <SelectItem key={church.id} value={String(church.id)}>
                  {church.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value!)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: string) => (value === ALL ? 'Tous les types' : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les types</SelectItem>
              {SIGNATURE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value!)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {(value: string) =>
                  value === ALL ? 'Tous les statuts' : STATUS_LABELS[value as SignatureStatus]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les statuts</SelectItem>
              {SIGNATURE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value)
              setPage(1)
            }}
            className="w-40"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {signatures.isLoading && <Skeleton className="h-64 w-full" />}
          {signatures.data && signatures.data.signatures.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucune signature ne correspond.</p>
          )}
          {signatures.data && signatures.data.signatures.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paroissien</TableHead>
                    <TableHead>Église</TableHead>
                    <TableHead>Mois</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.data.signatures.map((signature) => (
                    <TableRow key={signature.id}>
                      <TableCell>
                        <div className="font-medium">{signature.nomParoissien}</div>
                        {signature.user && (
                          <div className="text-muted-foreground text-xs">
                            {signature.user.email}
                          </div>
                        )}
                        {signature.ancienNom && (
                          <div className="text-muted-foreground text-xs">
                            Signé par {signature.ancienNom}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {churches.data?.find((c) => c.id === signature.churchId)?.nom ?? '—'}
                      </TableCell>
                      <TableCell>{signature.month}</TableCell>
                      <TableCell>{signature.amount} FCFA</TableCell>
                      <TableCell>{signature.fees} FCFA</TableCell>
                      <TableCell>
                        <Badge variant="outline">{signature.signatureType}</Badge>
                      </TableCell>
                      <TableCell>
                        {signature.paymentMethod}
                        {signature.phoneNumber ? ` — ${signature.phoneNumber}` : ''}
                      </TableCell>
                      <TableCell>
                        <SignatureStatusBadge status={signature.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(signature)}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDelete(signature)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  {signatures.data.pagination.from ?? 0}–{signatures.data.pagination.to ?? 0} sur{' '}
                  {signatures.data.pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= signatures.data.pagination.last_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateSignatureDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditSignatureDialog
        key={editingSignature?.id ?? 'edit'}
        open={editOpen}
        onOpenChange={setEditOpen}
        signature={editingSignature}
      />
      <DeleteSignatureDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        signature={deletingSignature}
      />
    </div>
  )
}
