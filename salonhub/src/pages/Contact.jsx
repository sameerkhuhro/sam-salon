import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react'
import { site } from '@/config/site'
import PageHero from '@/components/ui/PageHero'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [err, setErr] = useState({})
  const [sent, setSent] = useState(false)

  const handleChange = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    if (err[k]) setErr({ ...err, [k]: null })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = {}
    if (form.name.trim().length < 2) errors.name = 'Please enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Please provide a valid email address.'
    if (form.message.trim().length < 10) errors.message = 'Please share a brief message (min 10 characters).'
    
    setErr(errors)
    if (Object.keys(errors).length === 0) {
      setSent(true)
    }
  }

  return (
    <>
      <PageHero
        title="Visit Us or Get in Touch"
        text="Located in the heart of Khairpur Mir's. Have a question about our services, bridal bookings, or private appointments? We're here to assist."
        eyebrow="Khairpur Mir's Concierge"
      />

      <section className="section bg-ivory">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            
            {/* Left Column: Salon Information */}
            <div className="lg:col-span-5">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-mutedBrown">
                DIRECT CONTACT
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-charcoal">
                We'd love to hear from you
              </h2>
              <p className="mt-4 font-body text-sm sm:text-base text-mutedBrown leading-relaxed">
                Walk-ins are warmly welcomed subject to specialist availability, but advance reservations are always recommended to guarantee your time.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown">
                      Salon Address
                    </p>
                    <p className="mt-1 font-body text-sm font-medium text-charcoal">
                      {site.address}
                    </p>
                    <a
                      href={site.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 font-body text-xs font-semibold text-gold-deep hover:underline"
                    >
                      <span>Open on Google Maps</span>
                      <ArrowRight size={12} />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown">
                      Call or WhatsApp
                    </p>
                    <p className="mt-1 font-body text-sm font-medium text-charcoal">
                      <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-gold-deep transition-colors">
                        {site.phone}
                      </a>
                    </p>
                    <a
                      href={`https://wa.me/${site.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-body text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      <MessageSquare size={12} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown">
                      Email Inquiries
                    </p>
                    <p className="mt-1 font-body text-sm font-medium text-charcoal">
                      <a href={`mailto:${site.email}`} className="hover:text-gold-deep transition-colors">
                        {site.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Opening Hours Widget */}
              <div className="mt-12 rounded-xl border border-charcoal/10 bg-ivory-light p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-gold" />
                  <h3 className="font-display text-lg font-medium text-charcoal">
                    Salon Hours
                  </h3>
                </div>
                <ul className="space-y-2.5 font-body text-xs">
                  {site.hours.map(([d, t]) => (
                    <li key={d} className="flex justify-between border-b border-charcoal/5 pb-2">
                      <span className="font-medium text-charcoal">{d}</span>
                      <span className="text-mutedBrown">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-charcoal/10 bg-white p-8 sm:p-12 shadow-sm">
                <h3 className="font-display text-2xl font-medium text-charcoal">
                  Send a message
                </h3>
                <p className="mt-1.5 font-body text-sm text-mutedBrown">
                  Fill out the form below and our receptionist will reply promptly.
                </p>

                {sent ? (
                  <div className="mt-8 rounded-xl border border-gold/40 bg-ivory p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
                      <CheckCircle2 size={30} />
                    </div>
                    <h4 className="mt-4 font-display text-2xl font-medium text-charcoal">
                      Thank you, {form.name.split(' ')[0]}!
                    </h4>
                    <p className="mt-2 font-body text-sm text-mutedBrown">
                      We have received your message and will respond within a few business hours.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false)
                        setForm({ name: '', email: '', phone: '', message: '' })
                      }}
                      className="mt-6 rounded-sm bg-charcoal px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="c-name" className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                          Your Full Name *
                        </label>
                        <input
                          id="c-name"
                          type="text"
                          value={form.name}
                          onChange={handleChange('name')}
                          placeholder="e.g. Sana Ahmed"
                          className="field rounded-sm"
                          aria-invalid={!!err.name}
                        />
                        {err.name && <p className="field-error">{err.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="c-email" className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                          Email Address *
                        </label>
                        <input
                          id="c-email"
                          type="email"
                          value={form.email}
                          onChange={handleChange('email')}
                          placeholder="sana@example.com"
                          className="field rounded-sm"
                          aria-invalid={!!err.email}
                        />
                        {err.email && <p className="field-error">{err.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="c-phone" className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                        Phone Number (Optional)
                      </label>
                      <input
                        id="c-phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder="0300 1234567"
                        className="field rounded-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-message" className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                        Your Message or Inquiry *
                      </label>
                      <textarea
                        id="c-message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange('message')}
                        placeholder="Tell us what service you're interested in, bridal inquiries, or questions..."
                        className="field resize-none rounded-sm"
                        aria-invalid={!!err.message}
                      />
                      {err.message && <p className="field-error">{err.message}</p>}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-all hover:bg-gold hover:text-charcoal"
                    >
                      <span>Send inquiry</span>
                      <ArrowRight size={14} />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
