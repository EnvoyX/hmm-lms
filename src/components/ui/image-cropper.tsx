"use client"

import * as React from "react"
import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Slider } from "./slider"
import { cn } from "~/lib/utils"
import { Check, RotateCcw, RotateCw, X } from "lucide-react"
import Image from 'next/image'

interface ImageCropperProps {
  dialogProps?: React.ComponentProps<typeof Dialog>
  src: string
  cropShape?: "round" | "square"
  aspect?: number
  onCancel?: () => void
  onSave?: (croppedImageUrl: string) => void
}

export function ImageCropper({
  dialogProps,
  src,
  cropShape = "round",
  // aspect = 1,
  onCancel,
  onSave,
}: ImageCropperProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)
  const [scale, setScale] = React.useState([1])
  const [rotation, setRotation] = React.useState(0)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = React.useState(false)

  const cropSize = 300
  const cropRadius = cropSize / 2

  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = cropSize
    canvas.height = cropSize

    ctx.clearRect(0, 0, cropSize, cropSize)

    // Save the context state
    ctx.save()

    // Create clipping path
    ctx.beginPath()
    if (cropShape === "round") {
      ctx.arc(cropRadius, cropRadius, cropRadius, 0, Math.PI * 2)
    } else {
      ctx.rect(0, 0, cropSize, cropSize)
    }
    ctx.clip()

    // Apply transformations
    ctx.translate(cropRadius, cropRadius)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale[0]!, scale[0]!)
    ctx.translate(-cropRadius + position.x, -cropRadius + position.y)

    // Calculate image dimensions to maintain aspect ratio
    const imageAspect = image.naturalWidth / image.naturalHeight
    let drawWidth = cropSize
    let drawHeight = cropSize

    if (imageAspect > 1) {
      drawHeight = cropSize / imageAspect
    } else {
      drawWidth = cropSize * imageAspect
    }

    const offsetX = (cropSize - drawWidth) / 2
    const offsetY = (cropSize - drawHeight) / 2

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

    // Restore the context state
    ctx.restore()
  }, [imageLoaded, cropShape, cropRadius, rotation, scale, position.x, position.y])

  React.useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.8)
    onSave?.(croppedImageUrl)
  }

  const resetTransforms = () => {
    setScale([1])
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>Adjust your image by dragging, scaling, and rotating.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={cropSize}
                height={cropSize}
                className={cn(
                  "border-2 border-dashed border-muted-foreground/25 cursor-move select-none",
                  cropShape === "round" ? "rounded-full" : "rounded-lg",
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <Image
                ref={imageRef}
                src={src || "/placeholder.svg"}
                alt="Crop preview"
                className="hidden"
                onLoad={() => {
                  setImageLoaded(true)
                  drawCanvas()
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scale</label>
              <Slider
                value={scale}
                onValueChange={(value) => {
                  setScale(value)
                }}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(rotation - 90)}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Rotate Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(rotation + 90)}
                className="flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Rotate Right
              </Button>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={resetTransforms}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
