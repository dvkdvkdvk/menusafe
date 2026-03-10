'use client'

import { useCallback, useState, useRef } from 'react'
import { Camera, Upload, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string | null
  onChange: (base64: string | null, fileType?: string) => void
  disabled?: boolean
}

// Convert PDF to image on the client side using pdfjs-dist
async function convertPdfToImage(pdfData: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  const version = pdfjsLib.version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
  const page = await pdf.getPage(1)
  
  const scale = 1.5
  const viewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  
  const context = canvas.getContext('2d')!
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  await page.render({ canvasContext: context, viewport }).promise
  
  return canvas.toDataURL('image/jpeg', 0.8)
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      // Accept images and PDFs
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return
      
      if (file.type === 'application/pdf') {
        // Convert PDF to image on client side
        setIsProcessingPdf(true)
        try {
          const arrayBuffer = await file.arrayBuffer()
          const imageDataUrl = await convertPdfToImage(arrayBuffer)
          onChange(imageDataUrl, 'image/jpeg') // Send as compressed JPEG
          toast.success('PDF converted to image')
        } catch (error) {
          console.error('PDF conversion error:', error)
          toast.error('Could not process PDF. Please take a photo instead.')
        } finally {
          setIsProcessingPdf(false)
        }
        return
      }
      
      // Handle regular images
      const reader = new FileReader()
      reader.onload = () => {
        onChange(reader.result as string, file.type)
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (isProcessingPdf) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary bg-primary/5 p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Converting PDF to image...</p>
      </div>
    )
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border">
        <img
          src={value}
          alt="Menu photo"
          className="h-auto w-full max-h-80 object-contain bg-muted"
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-md"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
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
          Upload a menu photo or PDF
        </p>
        <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
          Drag and drop images or PDF files
        </p>
        <p className="mt-1 text-sm text-muted-foreground sm:hidden">
          Take a photo or upload a PDF menu
        </p>
      </div>
      {/* Mobile: Full-width stacked buttons with large tap targets */}
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
          Choose from Gallery
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
        }}
      />
    </div>
  )
}
