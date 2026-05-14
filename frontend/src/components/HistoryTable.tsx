'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, FileText, Loader2, Trash2 } from 'lucide-react'
import { ATSResume } from './ATSResume'
import { createClient } from '@/utils/supabase/client'

interface HistoryTableProps {
  userId: string
  refreshKey?: number
}

interface ConversionHistoryItem {
  id: string
  user_id: string
  original_filename: string
  json_data: any
  created_at: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getPdfFileName(item: ConversionHistoryItem) {
  const fullName = item.json_data?.personal_info?.full_name || 'Candidate'
  return `${fullName.replace(/[^a-zA-Z0-9\-_]/g, '_')}_CV.pdf`
}

export default function HistoryTable({ userId, refreshKey = 0 }: HistoryTableProps) {
  const supabase = useMemo(() => createClient(), [])
  const [history, setHistory] = useState<ConversionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('conversion_history')
      .select('id,user_id,original_filename,json_data,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setHistory(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory, refreshKey])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)

    const { error } = await supabase
      .from('conversion_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      setError(error.message)
    } else {
      setHistory((current) => current.filter((item) => item.id !== id))
    }

    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-4 py-10 text-center">
        <FileText className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-800">No conversions yet.</p>
        <p className="mt-1 text-sm text-slate-600">Upload an interview recording to generate your first CV.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead className="bg-slate-100/80">
            <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Original file</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-slate-50">
            {history.map((item) => (
              <tr key={item.id} className="transition hover:bg-blue-50/40">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.original_filename}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.json_data?.personal_info?.full_name || 'Candidate name unavailable'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <PDFDownloadLink
                      document={<ATSResume data={item.json_data} />}
                      fileName={getPdfFileName(item)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-slate-50 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {({ loading }) => (
                        loading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Preparing
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            ATS PDF
                          </>
                        )
                      )}
                    </PDFDownloadLink>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Delete ${item.original_filename}`}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
