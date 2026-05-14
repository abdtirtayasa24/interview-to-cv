'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/utils/supabase/client'
import { UploadCloud, FileAudio, FileVideo, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadZoneProps {
  userId: string
}

export default function UploadZone({ userId }: UploadZoneProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const[errorMessage, setErrorMessage] = useState<string | null>(null)
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setStatus('uploading')
      setErrorMessage(null)

      // 1. Sanitize filename and create a unique path: user_id/timestamp_filename
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const filePath = `${userId}/${Date.now()}_${safeFileName}`

      // 2. Upload directly to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp_media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      setStatus('processing')

      // 3. Get the user's current session token to authenticate the backend request
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) throw new Error('Authentication token not found')

      // 4. Trigger the FastAPI backend to start processing the file
      const response = await fetch('http://127.0.0.1:8000/api/process-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ file_path: uploadData.path })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to process media')
      }

      setStatus('success')
      
      // TODO: In Phase 5, we will handle the returned JSON and generate the PDF here.
      
    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message)
      setStatus('error')
    }
  }, [userId, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'video/*':['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 200 * 1024 * 1024, // 200MB limit
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'processing'
  })

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${(status === 'uploading' || status === 'processing') ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {status === 'idle' && (
            <>
              <UploadCloud className="w-12 h-12 text-gray-400" />
              <div className="text-lg font-medium text-gray-700">
                Drag & drop an interview recording here
              </div>
              <p className="text-sm text-gray-500">
                Supports Audio & Video up to 200MB
              </p>
            </>
          )}

          {status === 'uploading' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="text-lg font-medium text-gray-700">Uploading to secure storage...</div>
            </>
          )}

          {status === 'processing' && (
            <>
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <div className="text-lg font-medium text-gray-700">AI is analyzing the interview...</div>
              <p className="text-sm text-gray-500">This may take a few minutes depending on file size.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div className="text-lg font-medium text-green-700">Processing Complete!</div>
              <button 
                onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Upload another file
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="text-lg font-medium text-red-700">Something went wrong</div>
              <p className="text-sm text-red-500">{errorMessage}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}