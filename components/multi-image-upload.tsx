'use client'

import { useCallback, useState, useRef } from 'react'
import { Camera, Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MultiImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  disabled?: boolean
  maxImages?: number
}

// Convert PDF to images on the client side using pdfjs-dist
async function convertPdfToImages(pdfData: ArrayBuffer): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist')
  const version = pdfjsLib.version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
  const images: string[] = []
  
  // Convert all pages (up to 10)
  const maxPages = Math.min(pdf.numPages, 10)
  
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const scale = 1.5
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    const context = canvas.getContext('2d')!
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    await page.render({ canvasContext: context, viewport }).promise
    images.push(canvas.toDataURL('image/jpeg', 0.8))
  }
  
  return images
}

export function MultiImageUpload({ images, onChange, disabled, maxImages = 10 }: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const newImages: string[] = []
      
      setIsProcessing(true)
      try {
        for (const file of fileArray) {
          if (images.length + newImages.length >= maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`)
            break
          }
          
          if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer()
            const pdfImages = await convertPdfToImages(arrayBuffer)
            newImages.push(...pdfImages.slice(0, maxImages - images.length - newImages.length))
            toast.success(`PDF converted: ${pdfImages.length} page(s)`)
          } else if (file.type.startsWith('image/')) {
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
            newImages.push(dataUrl)
          }
        }
        
        if (newImages.length > 0) {
          onChange([...images, ...newImages])
        }
      } catch (error) {
        console.error('Error processing files:', error)
        toast.error('Could not process some files')
      } finally {
        setIsProcessing(false)
      }
    },
    [images, onChange, maxImages]
  )

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index))
    },
    [images, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary bg-primary/5 p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Processing images...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-muted">
              <img
                src={image}
                alt={`Menu page ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 rounded-full shadow-md"
                onClick={() => removeImage(index)}
                disabled={disabled}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                {index + 1}/{images.length}
              </div>
            </div>
          ))}
          
          {/* Add More Button */}
          {images.length < maxImages && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State / Upload Area */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed p-6 transition-colors sm:p-8',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 sm:h-14 sm:w-14">
            <ImageIcon className="h-8 w-8 text-primary sm:h-7 sm:w-7" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-foreground sm:text-sm">
              Upload menu photos or PDF
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You can add multiple pages
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="default"
              onClick={() => cameraInputRef.current?.click()}
              className="h-12 gap-2 text-base sm:h-9 sm:text-sm"
              disabled={disabled}
            >
              <Camera className="h-5 w-5 sm:h-4 sm:w-4" />
              Take Photo
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 gap-2 text-base sm:h-9 sm:text-sm"
              disabled={disabled}
            >
              <Upload className="h-5 w-5 sm:h-4 sm:w-4" />
              Choose Files
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
