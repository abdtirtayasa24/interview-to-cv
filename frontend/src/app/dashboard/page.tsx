import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UploadZone from '@/components/UploadZone'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI CV Generator</h1>
            <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
          </div>
          {/* We will add a logout button and template management here later */}
        </header>

        <main className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">New Conversion</h2>
          <p className="text-gray-600 mb-6">Upload an interview recording to automatically generate a structured CV.</p>
          
          <UploadZone userId={user.id} />
        </main>

        {/* Placeholder for Conversion History Table (Phase 5) */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Conversions</h2>
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
            Your conversion history will appear here.
          </div>
        </section>
      </div>
    </div>
  )
}