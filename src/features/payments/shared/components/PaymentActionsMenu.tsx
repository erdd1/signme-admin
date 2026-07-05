import { Download, Eye, FileText, MoreHorizontal, RefreshCw, ScrollText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface PaymentActionsMenuProps {
  /** true si aucune PaymentTransaction n'est associée (ex: signature présentiel) */
  disabled?: boolean
  disabledReason?: string
  /** "Revérifier" n'est actif que si le statut est encore pending */
  canRecheck: boolean
  isRechecking: boolean
  onViewDetail: () => void
  onViewReceipt: () => void
  onRecheck: () => void
  onViewLogs: () => void
  onExportPdf: () => void
}

export function PaymentActionsMenu({
  disabled = false,
  disabledReason,
  canRecheck,
  isRechecking,
  onViewDetail,
  onViewReceipt,
  onRecheck,
  onViewLogs,
  onExportPdf,
}: PaymentActionsMenuProps) {
  const trigger = (
    <Button variant="ghost" size="icon" disabled={disabled}>
      <MoreHorizontal />
    </Button>
  )

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span>{trigger}</span>} />
        <TooltipContent>
          {disabledReason ?? 'Aucune action disponible pour cette ligne.'}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onViewDetail}>
          <Eye /> Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewReceipt}>
          <FileText /> Voir le reçu
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canRecheck || isRechecking} onClick={onRecheck}>
          <RefreshCw /> Revérifier le statut
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewLogs}>
          <ScrollText /> Voir les logs de la transaction
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPdf}>
          <Download /> Exporter (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
