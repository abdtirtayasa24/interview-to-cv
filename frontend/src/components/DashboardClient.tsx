'use client'

import { useState } from 'react'
import UploadZone from '@/components/UploadZone'
import HistoryTable from '@/components/HistoryTable'
import TemplateManager from '@/components/TemplateManager'
import LogoutButton from '@/components/LogoutButton'

interface DashboardClientProps {
  user: {
    id: string
    email?: string
  }
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="rounded-3xl border border-slate-200 bg-slate-100/70 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Interview-to-CV workspace
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  AI CV Generator
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Signed in as {user.email ?? 'your account'}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-7">
            <div className="mb-6 max-w-2xl">
              <p className="text-sm font-medium text-blue-700">New conversion</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Turn an interview recording into CV data
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upload one audio or video interview. The generated CV data is saved to your conversion history after processing and cleanup complete.
              </p>
            </div>

            <UploadZone
              userId={user.id}
              onConversionComplete={() => setHistoryRefreshKey((key) => key + 1)}
            />
          </section>

          <TemplateManager userId={user.id} />
        </main>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Conversion History</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Conversion history
              </h2>
            </div>
            <p className="text-sm text-slate-500">Download ATS-ready PDFs or remove saved records.</p>
          </div>

          <HistoryTable userId={user.id} refreshKey={historyRefreshKey} />
        </section>
      </div>
    </div>
  )
}
