'use client'

import { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AlertCircle, CheckCircle, Loader2, UploadCloud } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface UploadZoneProps {
  userId: string
  onConversionComplete?: () => void
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'cleaning' | 'success' | 'error'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const errorData = await response.json()
    return errorData.detail || fallback
  } catch {
    return fallback
  }
}

export default function UploadZone({ userId, onConversionComplete }: UploadZoneProps) {
  const supabase = useMemo(() => createClient(), [])
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const busy = status === 'uploading' || status === 'processing' || status === 'cleaning'

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setStatus('uploading')
      setErrorMessage(null)

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const filePath = `${userId}/${Date.now()}_${safeFileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp_media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) throw new Error('Authentication token not found')

      setStatus('processing')

      const processResponse = await fetch(`${API_BASE_URL}/api/process-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file_path: uploadData.path }),
      })

      if (!processResponse.ok) {
        throw new Error(await readErrorMessage(processResponse, 'Failed to process media'))
      }

      setStatus('cleaning')

      const cleanupResponse = await fetch(
        `${API_BASE_URL}/api/cleanup-media?file_path=${encodeURIComponent(uploadData.path)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!cleanupResponse.ok) {
        throw new Error(await readErrorMessage(cleanupResponse, 'CV generated, but temporary file cleanup failed.'))
      }

      setStatus('success')
      onConversionComplete?.()
    } catch (error) {
      console.error(error)
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
      setStatus('error')
    }
  }, [onConversionComplete, supabase, userId])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    },
    maxSize: 200 * 1024 * 1024,
    maxFiles: 1,
    disabled: busy,
  })

  const rejectionMessage = fileRejections[0]?.errors[0]?.message

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`rounded-3xl border border-dashed p-8 text-center transition sm:p-10 ${
          busy ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        } ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-slate-100/70 hover:border-blue-300 hover:bg-blue-50/60'
        }`}
      >
        <input {...getInputProps()} />

        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4">
          {status === 'idle' && (
            <>
              <div className="rounded-2xl bg-blue-50 p-4 text-blue-700 ring-1 ring-blue-100">
                <UploadCloud className="h-10 w-10" />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">
                  Drop an interview recording here
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Supports audio and video up to 200MB. Processing may take a few minutes.
                </p>
              </div>
            </>
          )}

          {status === 'uploading' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <div>
                <div className="text-base font-semibold text-slate-900">Uploading recording</div>
                <p className="mt-2 text-sm text-slate-600">Sending the file to secure storage.</p>
              </div>
            </>
          )}

          {status === 'processing' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <div>
                <div className="text-base font-semibold text-slate-900">Analyzing the interview</div>
                <p className="mt-2 text-sm text-slate-600">Extracting structured CV information.</p>
              </div>
            </>
          )}

          {status === 'cleaning' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <div>
                <div className="text-base font-semibold text-slate-900">Cleaning temporary media</div>
                <p className="mt-2 text-sm text-slate-600">Finalizing the conversion before it appears in history.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-10 w-10 text-emerald-600" />
              <div>
                <div className="text-base font-semibold text-emerald-800">Conversion complete</div>
                <p className="mt-2 text-sm text-slate-600">Your CV data is now available in Conversion History.</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setStatus('idle')
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload another file
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-10 w-10 text-red-600" />
              <div>
                <div className="text-base font-semibold text-red-700">Conversion could not finish</div>
                <p className="mt-2 text-sm leading-6 text-red-600">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setStatus('idle')
                }}
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>

      {rejectionMessage && (
        <p className="mt-3 text-sm text-red-600">{rejectionMessage}</p>
      )}
    </div>
  )
}
