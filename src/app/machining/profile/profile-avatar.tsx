"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { ImageCropper } from "~/components/ui/image-cropper"
import { Camera, User } from "lucide-react"
import { cn } from "~/lib/utils"

interface ProfileAvatarProps {
  src?: string
  name: string
  size?: "sm" | "md" | "lg" | "xl"
  editable?: boolean
  onImageChange?: (image: string) => void
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
}

export function ProfileAvatar({
  src,
  name,
  size = "lg",
  editable = false,
  onImageChange,
  className,
}: ProfileAvatarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState<string>("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setTempImageSrc(result)
        setIsEditing(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCrop = (croppedImage: string) => {
    onImageChange?.(croppedImage)
    setIsEditing(false)
    setTempImageSrc("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempImageSrc("")
  }

  // const getInitials = (name: string) => {
  //   return name
  //     .split(" ")
  //     .map((word) => word[0])
  //     .join("")
  //     .toUpperCase()
  //     .slice(0, 2)
  // }

  return (
    <>
      <div className={cn("relative group", className)}>
        <Avatar className={cn(sizeClasses[size], "transition-all duration-200")}>
          <AvatarImage src={src ?? "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            <User className="h-1/2 w-1/2" />
          </AvatarFallback>
        </Avatar>

        {editable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="ghost"
              className="h-auto p-2 text-white hover:bg-white/20"
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        )}

        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>

      <ImageCropper
        dialogProps={{ open: isEditing, onOpenChange: setIsEditing }}
        src={tempImageSrc || "/placeholder.svg"}
        cropShape="round"
        onCancel={handleCancel}
        onSave={handleCrop}
      />
    </>
  )
}
