/**
 * SalonHub Public Client API Layer
 * Connects customer booking flows directly to Node.js/Express backend and MongoDB Atlas.
 */

import { site } from '@/config/site'
import { timeLabel } from './format'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const LOCAL_STORAGE_KEY = 'salonhub:bookings'

// Local storage fallback helper
const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export async function getAvailability({ staffId, date, durationMin = 45 }) {
  try {
    const res = await fetch(
      `${API_BASE}/appointments/availability?staffId=${encodeURIComponent(
        staffId
      )}&date=${encodeURIComponent(date)}&durationMin=${durationMin}`
    )
    if (res.ok) {
      const data = await res.json()
      if (data.slots && data.slots.length > 0) {
        return data.slots
      }
    }
  } catch (err) {
    console.warn('[API] Backend availability fetch error, falling back:', err.message)
  }

  // Graceful client fallback calculation if server is offline
  const { open, close, stepMin } = site.slot
  const out = []
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const localBooked = Object.values(readLocal())
    .filter((b) => b.date === date && b.staffId === staffId)
    .map((b) => b.time)
  const taken = new Set(localBooked)

  for (let t = open * 60; t + durationMin <= close * 60; t += stepMin) {
    const label = timeLabel(Math.floor(t / 60), t % 60)
    out.push({
      label,
      available: hash(`${staffId}${date}${t}`) % 5 !== 0 && !taken.has(label),
    })
  }
  return out
}

export async function createBooking(data) {
  const customerName = (data.customerName || data.name || '').trim()
  const customerPhone = (data.customerPhone || data.phone || '').trim()
  const customerEmail = (data.customerEmail || data.email || '').trim()

  const payload = {
    serviceId: data.serviceId,
    serviceIds: Array.isArray(data.serviceIds) && data.serviceIds.length > 0
      ? data.serviceIds
      : data.serviceId
      ? data.serviceId.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    services: Array.isArray(data.services) ? data.services : [],
    serviceName: data.serviceName,
    price: data.price,
    durationMin: data.durationMin,
    staffId: data.staffId,
    staffName: data.staffName,
    date: data.date,
    time: data.time,
    customerName,
    customerPhone,
    customerEmail,
    notes: data.notes || '',
  }

  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(result.message || `Booking failed with status ${res.status}`)
  }

  if (result.appointment) {
    // Also cache locally in client browser for convenience
    const all = readLocal()
    const ref = result.ref || result.appointment.ref
    all[ref] = result.appointment
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
    } catch {}
    return result.appointment
  }

  throw new Error('Server did not return a valid confirmed appointment')
}

export async function getLiveServices() {
  try {
    const res = await fetch(`${API_BASE}/services?status=active`)
    if (res.ok) {
      const data = await res.json()
      if (data.services && data.services.length > 0) {
        return data.services.map((s) => ({
          ...s,
          id: s._id ? s._id.toString() : s.id,
        }))
      }
    }
  } catch (err) {
    console.warn('[API] Live services fetch error:', err.message)
  }
  return null
}

export async function getFeaturedServices() {
  try {
    const res = await fetch(`${API_BASE}/services/featured`)
    if (res.ok) {
      const data = await res.json()
      if (data.services && data.services.length > 0) {
        return data.services.map((s) => ({
          ...s,
          id: s._id ? s._id.toString() : s.id,
        }))
      }
    }
  } catch (err) {
    console.warn('[API] Live featured services fetch error:', err.message)
  }
  return null
}

export async function getLiveStaff() {
  try {
    const res = await fetch(`${API_BASE}/staff?status=active`)
    if (res.ok) {
      const data = await res.json()
      if (data.staff && data.staff.length > 0) {
        return data.staff.map((st) => ({
          ...st,
          id: st._id ? st._id.toString() : st.id,
          photo: st.avatar || st.photo,
        }))
      }
    }
  } catch (err) {
    console.warn('[API] Live staff fetch error:', err.message)
  }
  return null
}

export async function getFeaturedStaff() {
  try {
    const res = await fetch(`${API_BASE}/staff/featured`)
    if (res.ok) {
      const data = await res.json()
      if (data.staff && data.staff.length > 0) {
        return data.staff.map((st) => ({
          ...st,
          id: st._id ? st._id.toString() : st.id,
          photo: st.avatar || st.photo,
        }))
      }
    }
  } catch (err) {
    console.warn('[API] Live featured staff fetch error:', err.message)
  }
  return null
}

export async function findBooking(ref) {
  if (!ref) return null

  try {
    const res = await fetch(`${API_BASE}/appointments/ref/${encodeURIComponent(ref)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.appointment) {
        return data.appointment
      }
    }
  } catch (err) {
    console.warn('[API] Backend findBooking lookup error:', err.message)
  }

  // Check local fallback
  return readLocal()[ref] || null
}
