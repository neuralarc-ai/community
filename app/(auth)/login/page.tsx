'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabaseClient'
import { ArrowRight, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabase) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Redirect to dashboard after successful login
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl border border-white/10 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                 <span className="text-white font-bold text-xl font-heading">C</span>
             </div>
             <h1 className="text-3xl font-heading font-bold text-white tracking-tight mb-2">Welcome back</h1>
             <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 pl-1">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all hover:border-white/20"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label htmlFor="password" className="block text-sm font-medium text-white/80">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-white transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/10 rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all hover:border-white/20"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-base font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                  <span className="px-4 bg-[#0F0F0F]/50 backdrop-blur-sm text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <div className="mt-8">
                <button
                  type="button"
                  className="w-full flex justify-center items-center py-3 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all duration-300 hover:border-white/20 group"
                >
                  <svg className="w-5 h-5 mr-3 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.059 -9.24426 56.199 -10.3643 56.929 L -10.3843 56.939 L -6.34426 59.989 L -6.30426 60.009 C -4.53426 61.609 -2.15426 62.629 0.415737 62.629 C 5.41574 62.629 9.20574 59.139 9.20574 54.599 C 9.20574 54.199 9.16574 53.809 9.08574 53.429 L 9.08574 53.429 L 9.07574 53.429 L 1.99574 53.429 L 1.99574 57.029 L 6.32574 57.029 C 5.93574 58.279 5.07574 59.299 3.91574 59.889 L 3.89574 59.899 L 0.535737 62.549 L 0.505737 62.559 C 1.75574 63.709 3.38574 64.369 5.18574 64.369 C 8.85574 64.369 12.7357 61.819 14.2457 58.489 C 15.6157 55.419 14.5557 51.999 14.5557 51.999 C 13.7157 49.809 12.3457 48.059 10.6557 46.999 C 9.03574 45.989 7.09574 45.369 5.18574 45.369 C 2.06574 45.369 -0.834264 46.909 -2.35426 49.489 C -2.66426 50.069 -2.91426 50.719 -3.10426 51.409 C -3.18426 51.719 -3.22426 52.039 -3.24426 52.359 C -3.26426 52.669 -3.264 51.509 -3.264 51.509"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.80426 62.159 -6.70426 60.279 L -3.10426 62.939 C -5.96426 66.569 -10.2043 68.869 -14.754 68.869 C -17.1143 68.869 -19.3543 68.249 -21.3343 67.059 C -23.3143 65.869 -24.9343 64.149 -25.9943 62.059 L -26.0043 62.059 L -30.2743 64.969 L -30.3343 64.969 C -28.4243 68.939 -24.9143 71.869 -20.7443 73.119 C -18.7843 73.719 -16.7343 74.039 -14.754 74.039 C -9.24426 74.039 -4.32426 71.619 -1.38426 67.859 L 2.25574 70.459 C -1.33426 75.799 -7.52426 79.369 -14.754 79.369 C -22.6543 79.369 -29.4643 76.249 -34.5843 70.609 C -39.7043 64.969 -42.0043 57.509 -42.0043 49.869 C -42.0043 42.229 -39.7043 34.759 -34.5843 29.129 C -32.8143 27.249 -30.7843 25.629 -28.5543 24.329 C -24.7743 22.129 -20.4243 20.869 -15.8543 20.589 L -12.4443 20.589 L -13.1543 24.319 C -16.2843 24.719 -19.2543 25.929 -21.8243 27.809 C -25.0143 30.159 -27.2443 33.419 -28.0843 37.159 L -15.8043 37.159 C -15.1743 37.159 -14.754 37.579 -14.754 38.209 L -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -25.9943 37.159 C -25.7843 36.469 -25.6643 35.739 -25.6643 34.999 C -25.6643 34.249 -25.7843 33.519 -25.9943 32.829 L -25.9943 32.819 L -30.2143 29.909 L -30.2743 29.909 C -31.0243 31.479 -31.4043 33.259 -31.4043 34.999 C -31.4043 36.739 -31.0243 38.519 -30.2743 40.089 L -30.2743 40.089 L -25.9943 37.159"/>
                      <path fill="#EB4335" d="M -14.754 43.519 C -12.9843 43.499 -11.3643 44.149 -10.0943 45.249 L -6.27426 42.099 C -8.20426 40.289 -10.7343 39.208 -13.5243 39.208 C -15.6943 39.208 -17.7043 39.939 -19.3343 41.259 C -20.9643 42.579 -22.0943 44.379 -22.5243 46.429 L -18.6543 48.969 C -17.7843 46.089 -16.0943 43.519 -14.754 43.519"/>
                    </g>
                  </svg>
                  Continue with Google
                </button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
