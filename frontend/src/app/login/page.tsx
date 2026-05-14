'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Mail, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Interview-to-CV workspace
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
                Generate structured CVs from interview recordings.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                Sign in to upload recordings, manage CV Templates, and keep Conversion History ready for PDF export.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100/70 p-4">
                  <ShieldCheck className="h-5 w-5 text-blue-700" />
                  Authenticated access keeps each user scoped to their own records.
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100/70 p-4">
                  <Mail className="h-5 w-5 text-blue-700" />
                  Passwordless email OTP keeps login quick for production use.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-100/70 p-5 shadow-sm sm:p-7">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  {step === 'email' ? <Mail className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  {step === 'email' ? 'Sign in to AI CV Generator' : 'Check your email'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step === 'email'
                    ? 'Enter your email and we will send a one-time password.'
                    : `Enter the OTP sent to ${email}.`}
                </p>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="hr@company.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-slate-50 shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Sending OTP' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                      One-time password
                    </label>
                    <input
                      id="otp"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="123456"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-slate-50 shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Verifying' : 'Verify and continue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setOtp('')
                      setError(null)
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to email
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
