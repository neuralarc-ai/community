'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import { Fira_Code } from 'next/font/google'

const firaCode = Fira_Code({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fira-code',
})

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
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-cyber-bg font-mono text-cyber-text m-0 min-h-screen grid place-items-center p-5 ${firaCode.className}`}>
        <div className="flex rounded-lg overflow-hidden shadow-glow border border-cyber-border w-full max-w-5xl">
            {/* Left Panel with Image */}
            <div className="flex-1 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWJzdHJhY3QlMjBkYXJrJTIwbmVvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80')" }}>
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 z-0"></div>
                
                {/* Content with improved contrast */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-10">
                    <h3 className="text-2xl font-semibold text-white mb-4">Unlock The Future with Sphere</h3>
                    <p className="text-gray-100">Built for Helionots</p>
                </div>
            </div>
            
            {/* Right Panel with Form */}
            <div className="flex-[1.2] bg-cyber-component p-10">
                <h3 className="text-2xl font-semibold text-white text-center mb-6">Access Your Portal</h3>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-cyber-secondary font-medium mb-2">Email ID</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="w-full bg-cyber-input text-cyber-text border border-cyber-border rounded-md px-4 py-3 focus:outline-none focus:border-cyber-accent focus:ring-2 focus:ring-cyber-accent/30" 
                            placeholder="Enter your Email ID" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="mb-5">
                        <label htmlFor="password" className="block text-cyber-secondary font-medium mb-2">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="w-full bg-cyber-input text-cyber-text border border-cyber-border rounded-md px-4 py-3 focus:outline-none focus:border-cyber-accent focus:ring-2 focus:ring-cyber-accent/30" 
                            placeholder="Enter your Password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 text-sm">
                        <label className="flex items-center text-cyber-secondary cursor-pointer">
                            <input type="checkbox" name="remember" className="mr-2 appearance-none w-4 h-4 border border-cyber-border rounded bg-cyber-input checked:bg-cyber-accent relative" />
                            <span>Secure session</span>
                        </label>
                        <a href="#" className="text-cyber-accent hover:text-cyber-accentHover">Auth Issues?</a>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-cyber-accent text-cyber-bg py-3 rounded-md font-medium shadow-glow hover:bg-cyber-accentHover hover:shadow-glow-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                        disabled={loading}
                    >
                        {loading ? 'Connecting...' : 'Connect'}
                    </button>

                    <div className="mt-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-cyber-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                                <span className="px-2 bg-cyber-component text-cyber-secondary">Or continue with</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="w-full bg-white text-black py-3 rounded-md font-medium shadow-glow hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
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
                    
                    <p className="text-center mt-6 text-sm text-cyber-secondary">
                        Need clearance? <a href="#" className="text-cyber-accent hover:text-cyber-accentHover">Request Access</a>
                    </p>
                </form>
            </div>
        </div>
    </div>
  )
}
