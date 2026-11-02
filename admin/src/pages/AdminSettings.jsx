import { useEffect, useState } from 'react'
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  Globe,
  Bell,
  Clock,
  Shield,
  Image as ImageIcon,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import ImageUpload from '../components/ui/ImageUpload'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    adminService.getSettings().then((data) => {
      setSettings(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await adminService.updateSettings(settings)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading || !settings) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-3 font-body text-xs text-mutedBrown">Loading salon settings…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-medium text-charcoal">
          Salon Settings &amp; Configuration
        </h2>
        <p className="font-body text-xs text-mutedBrown">
          Manage business identity, booking rules, regional defaults, and communication preferences.
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Salon configuration saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Business Profile */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-charcoal/10 pb-4 mb-4">
            <Building size={18} className="text-gold-deep" />
            <h3 className="font-display text-lg font-medium text-charcoal">
              Salon Identity &amp; Location
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Salon Name
              </label>
              <input
                type="text"
                value={settings.salonName}
                onChange={(e) => setSettings({ ...settings, salonName: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
              Physical Address (Khairpur Mir's)
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Section 1b: Brand Assets & Visual Identity */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-charcoal/10 pb-4 mb-4">
            <ImageIcon size={18} className="text-gold-deep" />
            <h3 className="font-display text-lg font-medium text-charcoal">
              Brand Assets &amp; Media (Cloudinary / Storage)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                label="Official Salon Emblem / Logo"
                value={settings.logo?.url || settings.logo || ''}
                onChange={(url, publicId) =>
                  setSettings({
                    ...settings,
                    logo: { url, publicId },
                  })
                }
                folder="salon"
                aspect="square"
                helperText="Transparent PNG or crisp vector/JPG logo"
              />
            </div>

            <div>
              <ImageUpload
                label="Hero Showcase Banner"
                value={
                  settings.gallery && settings.gallery[0]
                    ? settings.gallery[0].url
                    : settings.bannerUrl || ''
                }
                onChange={(url, publicId) => {
                  const existingGallery = Array.isArray(settings.gallery) ? [...settings.gallery] : []
                  existingGallery[0] = { url, publicId, title: 'Hero Banner' }
                  setSettings({
                    ...settings,
                    gallery: existingGallery,
                    bannerUrl: url,
                  })
                }}
                folder="salon"
                aspect="video"
                helperText="Wide editorial salon atmosphere photo"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Regional Defaults */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-charcoal/10 pb-4 mb-4">
            <Globe size={18} className="text-gold-deep" />
            <h3 className="font-display text-lg font-medium text-charcoal">
              Regional &amp; Currency Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Operating Currency
              </label>
              <input
                type="text"
                disabled
                value={`${settings.currency} (Pakistani Rupee)`}
                className="w-full rounded border border-charcoal/10 bg-ivory/60 p-2 text-xs text-charcoal cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value={`${settings.timezone} (UTC+05:00)`}
                className="w-full rounded border border-charcoal/10 bg-ivory/60 p-2 text-xs text-charcoal cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Booking Policies & Buffer Times */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-charcoal/10 pb-4 mb-4">
            <Clock size={18} className="text-gold-deep" />
            <h3 className="font-display text-lg font-medium text-charcoal">
              Scheduling &amp; Buffer Policies
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Slot Step Interval
              </label>
              <select
                disabled
                value="30"
                className="w-full rounded border border-charcoal/10 bg-ivory/60 p-2 text-xs text-charcoal cursor-not-allowed"
              >
                <option value="30">30 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Sanitization Buffer
              </label>
              <select
                disabled
                value="10"
                className="w-full rounded border border-charcoal/10 bg-ivory/60 p-2 text-xs text-charcoal cursor-not-allowed"
              >
                <option value="10">10 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Advance Booking Window
              </label>
              <select
                disabled
                value="30"
                className="w-full rounded border border-charcoal/10 bg-ivory/60 p-2 text-xs text-charcoal cursor-not-allowed"
              >
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Notifications */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-charcoal/10 pb-4 mb-4">
            <Bell size={18} className="text-gold-deep" />
            <h3 className="font-display text-lg font-medium text-charcoal">
              Notifications &amp; Reminders
            </h3>
          </div>

          <div className="space-y-3 font-body text-xs">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-charcoal">Send Email Confirmations</p>
                <p className="text-[11px] text-mutedBrown">Dispatch automated booking confirmation and reference codes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.checked })}
                className="h-4 w-4 rounded text-gold focus:ring-gold"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-charcoal/5 pt-3">
              <div>
                <p className="font-medium text-charcoal">Send SMS Appointment Alerts</p>
                <p className="text-[11px] text-mutedBrown">Dispatch arrival reminder to client mobile 2 hours prior</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationSms}
                onChange={(e) => setSettings({ ...settings, notificationSms: e.target.checked })}
                className="h-4 w-4 rounded text-gold focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-7 py-3 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-all disabled:opacity-50 shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? 'Saving Settings…' : 'Save Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}

