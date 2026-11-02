export const money = (n) => `PKR ${n.toLocaleString('en-PK')}`
export const duration = (m) => (m >= 60 ? `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`)
export const longDate = (iso) => (iso ? new Date(iso + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '')
export const todayISO = () => new Date().toISOString().slice(0, 10)
export const timeLabel = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
