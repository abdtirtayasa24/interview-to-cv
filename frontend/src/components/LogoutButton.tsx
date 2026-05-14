'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    window.location.assign('/login')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sign out
    </button>
  )
}
