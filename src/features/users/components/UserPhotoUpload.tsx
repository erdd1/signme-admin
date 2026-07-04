import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/core/api/errors'
import { useUploadUserPhoto } from '@/features/users/hooks/useUploadUserPhoto'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface UserPhotoUploadProps {
  userId: number
  nom: string
  photoUrl: string | null
}

export function UserPhotoUpload({ userId, nom, photoUrl }: UserPhotoUploadProps) {
  const uploadPhoto = useUploadUserPhoto()
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format non supporté (JPEG, PNG ou WebP uniquement).')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('La photo ne doit pas dépasser 2 Mo.')
      return
    }

    setPreview(URL.createObjectURL(file))
    uploadPhoto.mutate(
      { id: userId, file },
      {
        onSuccess: () => toast.success('Photo mise à jour.'),
        onError: (error) => toast.error(getApiErrorMessage(error, "Échec de l'envoi de la photo.")),
      },
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-16">
        <AvatarImage src={preview ?? photoUrl ?? undefined} alt={nom} />
        <AvatarFallback>{nom.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploadPhoto.isPending}
      >
        Changer la photo
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
