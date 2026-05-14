'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ATSResume } from './ATSResume'
import { FileText, Download, Trash2, Loader2 } from 'lucide-react'

export default function HistoryTable({ userId }: { userId: string }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('conversion_history')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setHistory(data)
    setLoading(false)
  }

  useEffect(() => { fetchHistory() }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('conversion_history').delete().eq('id', id)
    if (!error) setHistory(history.filter(h => h.id !== id))
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-500">
            <th className="py-4 px-4 font-medium">Original File</th>
            <th className="py-4 px-4 font-medium">Date</th>
            <th className="py-4 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">{item.original_filename}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="py-4 px-4 text-right space-x-2">
                <PDFDownloadLink
                  document={<ATSResume data={item.json_data} />}
                  fileName={`${item.json_data.personal_info.full_name}_CV.pdf`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  {({ loading }) => (
                    loading ? 'Preparing...' : <><Download className="w-3 h-3" /> Download PDF</>
                  )}
                </PDFDownloadLink>
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}