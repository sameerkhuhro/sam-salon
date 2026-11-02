import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@salonhub.pk')
  const [password, setPassword] = useState('SalonHub@2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.')
      return
    }

    setBusy(true)
    const result = await login(email, password)
    setBusy(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-charcoal/5 blur-3xl" aria-hidden="true" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back to Public Site */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Public Website</span>
          </Link>
        </div>

        {/* Card Surface */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-8 sm:p-10 shadow-xl">
          
          {/* Header & Wordmark */}
          <div className="text-center">
            <div className="inline-flex items-baseline font-display text-3xl font-medium tracking-tight text-charcoal">
              <span>SAM SALON</span>
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
            </div>
            <p className="font-body text-[9px] uppercase tracking-[0.24em] text-gold-deep font-semibold mt-0.5">
              HAIR • BEAUTY • GROOMING
            </p>
            <h2 className="mt-5 font-display text-2xl font-normal text-charcoal">
              Admin Portal Access
            </h2>
            <p className="mt-1 font-body text-xs text-mutedBrown">
              Khairpur Mir's Salon Owner &amp; Management Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            
            {/* Error banner */}
            {error && (
              <div
                className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Admin Email
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-mutedBrown pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@salonhub.pk"
                  required
                  className="w-full rounded-sm border border-charcoal/20 bg-ivory/50 py-3 pl-10 pr-4 font-body text-sm text-charcoal outline-none transition-all focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-mutedBrown pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-sm border border-charcoal/20 bg-ivory/50 py-3 pl-10 pr-11 font-body text-sm text-charcoal outline-none transition-all focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-mutedBrown hover:text-charcoal p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-charcoal py-3.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-all hover:bg-gold hover:text-charcoal disabled:opacity-50 shadow-sm"
              >
                <span>{busy ? 'Authenticating…' : 'Enter Admin Dashboard'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Development Demo Notice */}
          <div className="mt-8 rounded-lg border border-charcoal/10 bg-ivory p-4 text-[11px] text-mutedBrown">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal mb-1">
              <ShieldCheck size={14} className="text-gold-deep" />
              <span>PBL Assignment Demo Credentials:</span>
            </div>
            <p>Email: <code className="font-mono text-charcoal font-semibold">admin@salonhub.pk</code></p>
            <p className="mt-0.5">Password: <code className="font-mono text-charcoal font-semibold">SalonHub@2026!</code></p>
          </div>

        </div>

      </div>
    </div>
  )
}

