import sharp from 'sharp'

// Compress and optimize an image buffer
export async function compressImageBuffer(
  buffer: Buffer,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 80
): Promise<Buffer> {
  try {
    const compressed = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true })
      .toBuffer()

    return compressed
  } catch (error) {
    console.error('Failed to compress image:', error)
    throw error
  }
}

// Get image metadata
export async function getImageMetadata(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata()
    return metadata
  } catch (error) {
    console.error('Failed to get image metadata:', error)
    throw error
  }
}

// Convert to WebP format for better compression
export async function convertToWebP(buffer: Buffer, quality: number = 80): Promise<Buffer> {
  try {
    const webp = await sharp(buffer)
      .webp({ quality })
      .toBuffer()

    return webp
  } catch (error) {
    console.error('Failed to convert to WebP:', error)
    throw error
  }
}
