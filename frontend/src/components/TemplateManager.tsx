'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface TemplateManagerProps {
  userId: string
}

interface CvTemplate {
  id: string
  user_id: string
  template_name: string
  storage_path: string
  is_default: boolean
  created_at: string
}

const MAX_TEMPLATE_SIZE = 10 * 1024 * 1024

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export default function TemplateManager({ userId }: TemplateManagerProps) {
  const supabase = useMemo(() => createClient(), [])
  const [templates, setTemplates] = useState<CvTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('templates')
      .select('id,user_id,template_name,storage_path,is_default,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setTemplates(data ?? [])
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setMessage(null)
    setError(null)

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('Upload a .docx CV Template.')
      return
    }

    if (file.size > MAX_TEMPLATE_SIZE) {
      setError('Template must be 10MB or smaller.')
      return
    }

    try {
      setUploading(true)
      const safeFileName = sanitizeFileName(file.name)
      const storagePath = `${userId}/${Date.now()}_${safeFileName}`
      const templateName = file.name.replace(/\.docx$/i, '')

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_templates')
        .upload(storagePath, file, {
          cacheControl: '3600',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: false,
        })

      if (uploadError) throw new Error(uploadError.message)

      const { data: insertedTemplate, error: insertError } = await supabase
        .from('templates')
        .insert({
          user_id: userId,
          template_name: templateName,
          storage_path: uploadData.path,
          is_default: false,
        })
        .select('id,user_id,template_name,storage_path,is_default,created_at')
        .single()

      if (insertError) {
        await supabase.storage.from('user_templates').remove([uploadData.path])
        throw new Error(insertError.message)
      }

      setTemplates((current) => [insertedTemplate as CvTemplate, ...current])
      setMessage('CV Template uploaded.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload template.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (template: CvTemplate) => {
    setMessage(null)
    setError(null)
    setDeletingId(template.id)

    try {
      const { error: storageError } = await supabase.storage
        .from('user_templates')
        .remove([template.storage_path])

      if (storageError) throw new Error(storageError.message)

      const { error: dbError } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id)
        .eq('user_id', userId)

      if (dbError) throw new Error(dbError.message)

      setTemplates((current) => current.filter((item) => item.id !== template.id))
      setMessage('CV Template deleted.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete template.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-blue-700">CV Templates</p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Brand-ready layouts</h2>
        <p className="text-sm leading-6 text-slate-600">
          Upload `.docx` templates for custom CV generation. Custom PDF generation will be added in a later pass.
        </p>
      </div>

      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50/60 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        ) : (
          <UploadCloud className="h-8 w-8 text-slate-500" />
        )}
        <span className="mt-3 text-sm font-medium text-slate-800">
          {uploading ? 'Uploading template...' : 'Upload .docx template'}
        </span>
        <span className="mt-1 text-xs text-slate-500">Up to 10MB</span>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          disabled={uploading}
          onChange={handleUpload}
        />
      </label>

      {message && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="space-y-3">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 text-sm leading-6 text-slate-600">
            No templates uploaded yet. Add a `.docx` template to generate branded CVs.
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-100/60 p-3"
            >
              <div className="min-w-0 flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{template.template_name}</p>
                    {template.is_default && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Uploaded {formatDate(template.created_at)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(template)}
                disabled={deletingId === template.id}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Delete ${template.template_name}`}
              >
                {deletingId === template.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
