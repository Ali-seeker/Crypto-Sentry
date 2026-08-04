"use client"

import { useState, useRef } from "react"
import { Camera, Loader2 } from "lucide-react"

interface AvatarUploadProps {
  initialImage: string | null
  initialLetter: string
}

export default function AvatarUpload({ initialImage, initialLetter }: AvatarUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Ensure it's an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setIsUploading(true)

    try {
      const compressedImage = await compressImage(file)
      
      // Optimistic update
      setImage(compressedImage)

      // Send to server
      const res = await fetch("/api/user/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: compressedImage }),
      })

      if (!res.ok) {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to save profile picture. Please try again.")
      // Revert optimistic update on failure
      setImage(initialImage)
    } finally {
      setIsUploading(false)
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Compress and resize image using HTML5 Canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          
          // Target size: 200x200
          const size = 200
          canvas.width = size
          canvas.height = size

          // Crop to square
          const minDim = Math.min(img.width, img.height)
          const sx = (img.width - minDim) / 2
          const sy = (img.height - minDim) / 2

          if (ctx) {
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
            // Compress to highly efficient WebP format
            const compressedDataUrl = canvas.toDataURL("image/webp", 0.7)
            resolve(compressedDataUrl)
          } else {
            reject(new Error("Canvas context is null"))
          }
        }
        img.onerror = (err) => reject(err)
      }
      reader.onerror = (err) => reject(err)
    })
  }

  return (
    <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-neon-cyan to-neon-cyan flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.4)] relative">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-black text-4xl font-bold">{initialLetter}</span>
        )}
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isUploading ? (
            <Loader2 className="text-neon-cyan animate-spin" size={28} />
          ) : (
            <Camera className="text-white" size={28} />
          )}
        </div>
      </div>
      
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
    </div>
  )
}
