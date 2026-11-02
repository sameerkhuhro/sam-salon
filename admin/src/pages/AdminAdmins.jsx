/**
 * SalonHub Admin Portal — Admin Account Management
 * Secure administrator account creation, profile editing, status toggling, and credential resets.
 */

import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  Plus,
  Search,
  Mail,
  Phone,
  Lock,
  Edit2,
  Power,
  Trash2,
  KeyRound,
  UserCheck,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { useAdminAuth } from '../context/AdminAuthContext'
import StatusBadge from '../components/ui/StatusBadge'
import AdminModal from '../components/ui/AdminModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ImageUpload from '../components/ui/ImageUpload'

export default function AdminAdmins() {
  const { adminUser } = useAdminAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Create / Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isNewAdmin, setIsNewAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin',
    avatar: '',
    avatarPublicId: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [targetAdmin, setTargetAdmin] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Confirmation Dialog State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null, // 'toggle' | 'delete'
    admin: null,
  })

  const loadAdmins = async () => {
    setLoading(true)
    try {
      const list = await adminService.getAdmins()
      setAdmins(list)
    } catch (err) {
      console.error('Failed to load admins:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  // Filtered admins
  const filteredAdmins = admins.filter((a) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q))
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Open Add Admin Modal
  const openAddModal = () => {
    setIsNewAdmin(true)
    setAdminForm({
      id: '',
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'admin',
      avatar: '',
      avatarPublicId: '',
    })
    setShowPassword(false)
    setFormError('')
    setEditModalOpen(true)
  }

  // Open Edit Admin Modal
  const openEditModal = (ad) => {
    setIsNewAdmin(false)
    setAdminForm({
      id: ad.id,
      name: ad.name,
      email: ad.email,
      password: '',
      phone: ad.phone || '',
      role: ad.role || 'admin',
      avatar: ad.avatar || '',
      avatarPublicId: ad.avatarPublicId || '',
    })
    setFormError('')
    setEditModalOpen(true)
  }

  // Handle Create / Edit Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!adminForm.name.trim()) {
      setFormError('Full name is required.')
      return
    }

    if (isNewAdmin) {
      if (!adminForm.email.trim()) {
        setFormError('Valid email is required.')
        return
      }
      if (!adminForm.password || adminForm.password.length < 6) {
        setFormError('Password must be at least 6 characters long.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (isNewAdmin) {
        await adminService.createAdmin(adminForm)
      } else {
        await adminService.updateAdmin(adminForm.id, {
          name: adminForm.name,
          phone: adminForm.phone,
          role: adminForm.role,
          avatar: adminForm.avatar,
          avatarPublicId: adminForm.avatarPublicId,
        })
      }
      setEditModalOpen(false)
      await loadAdmins()
    } catch (err) {
      setFormError(err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Open Reset Password Modal
  const openPasswordModal = (ad) => {
    setTargetAdmin(ad)
    setNewPassword('')
    setPasswordError('')
    setPasswordModalOpen(true)
  }

  // Handle Reset Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    try {
      await adminService.resetAdminPassword(targetAdmin.id, newPassword)
      setPasswordModalOpen(false)
      setTargetAdmin(null)
      alert(`Password for ${targetAdmin.name} has been updated successfully.`)
    } catch (err) {
      setPasswordError(err.message || 'Password update failed')
    }
  }

  // Handle Status Toggle Confirmation
  const confirmToggleStatus = async () => {
    if (!confirmState.admin) return
    try {
      await adminService.toggleAdminStatus(confirmState.admin.id)
      setConfirmState({ isOpen: false, type: null, admin: null })
      await loadAdmins()
    } catch (err) {
      alert(err.message || 'Failed to toggle status')
    }
  }

  // Handle Delete Confirmation
  const confirmDeleteAdmin = async () => {
    if (!confirmState.admin) return
    try {
      await adminService.deleteAdmin(confirmState.admin.id)
      setConfirmState({ isOpen: false, type: null, admin: null })
      await loadAdmins()
    } catch (err) {
      alert(err.message || 'Failed to delete admin')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-charcoal flex items-center gap-2">
            <ShieldCheck size={24} className="text-gold-deep" />
            <span>Administrator Management</span>
          </h2>
          <p className="font-body text-xs text-mutedBrown">
            Manage authenticated salon administrator accounts, operational permissions, and security credentials.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Administrator</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-2.5 text-mutedBrown pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 pl-9 pr-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-mutedBrown">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-sm border border-charcoal/20 bg-ivory/40 py-1.5 px-3 font-body text-xs text-charcoal outline-none focus:border-gold"
          >
            <option value="all">All Administrators</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="rounded-2xl border border-charcoal/10 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-3 font-body text-xs text-mutedBrown">Loading administrator accounts…</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="mx-auto text-taupe mb-2" size={32} />
            <h3 className="font-display text-xl font-medium text-charcoal">No administrator accounts found</h3>
            <p className="mt-1 font-body text-xs text-mutedBrown">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs text-charcoal border-collapse">
              <thead>
                <tr className="border-b border-charcoal/10 bg-ivory/50 font-semibold uppercase tracking-wider text-[11px] text-mutedBrown">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-5">Email &amp; Contact</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Last Activity</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredAdmins.map((ad) => {
                  const isSelf = adminUser?.email === ad.email
                  return (
                    <tr key={ad.id} className="hover:bg-ivory/20 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={ad.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={ad.name}
                            className="h-9 w-9 rounded-full object-cover border border-gold/40 shadow-2xs"
                          />
                          <div>
                            <p className="font-display text-sm font-medium text-charcoal flex items-center gap-1.5">
                              <span>{ad.name}</span>
                              {isSelf && (
                                <span className="rounded bg-gold/20 px-1.5 py-0.2 text-[9px] font-bold text-gold-deep uppercase">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-taupe">ID: {ad.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="font-medium text-charcoal flex items-center gap-1">
                            <Mail size={12} className="text-gold" />
                            <span>{ad.email}</span>
                          </p>
                          {ad.phone && (
                            <p className="text-[11px] text-mutedBrown flex items-center gap-1">
                              <Phone size={12} className="text-gold" />
                              <span>{ad.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 rounded bg-charcoal/5 px-2.5 py-1 text-[11px] font-semibold text-charcoal capitalize">
                          <ShieldCheck size={12} className="text-gold-deep" />
                          <span>{ad.role}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <StatusBadge status={ad.status} />
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-5 text-mutedBrown text-[11px]">
                        {ad.lastLogin ? (
                          <span>{new Date(ad.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span className="italic text-taupe">Never logged in</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => openPasswordModal(ad)}
                            className="rounded p-1.5 text-mutedBrown hover:text-gold-deep hover:bg-gold/10"
                            title="Reset Password"
                          >
                            <KeyRound size={15} />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => openEditModal(ad)}
                            className="rounded p-1.5 text-mutedBrown hover:text-charcoal hover:bg-charcoal/5"
                            title="Edit Administrator"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                type: 'toggle',
                                admin: ad,
                              })
                            }
                            disabled={isSelf}
                            className={`rounded p-1.5 disabled:opacity-30 disabled:cursor-not-allowed ${
                              ad.status === 'active'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={
                              isSelf
                                ? 'You cannot deactivate your own active session'
                                : ad.status === 'active'
                                ? 'Deactivate Administrator'
                                : 'Activate Administrator'
                            }
                          >
                            <Power size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                type: 'delete',
                                admin: ad,
                              })
                            }
                            disabled={isSelf}
                            className="rounded p-1.5 text-mutedBrown hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? 'Cannot delete self' : 'Delete Account'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Admin Modal */}
      {editModalOpen && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={isNewAdmin ? 'Create Administrator Account' : `Edit Account: ${adminForm.name}`}
          subtitle="Manage administrative privileges and profile details"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Asad Jameel"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Admin Email *
              </label>
              <input
                type="email"
                placeholder="asad@salonhub.pk"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                disabled={!isNewAdmin}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold disabled:bg-gray-100 disabled:text-gray-500"
                required
              />
              {!isNewAdmin && (
                <p className="text-[10px] text-mutedBrown mt-0.5">
                  Email address cannot be modified after creation.
                </p>
              )}
            </div>

            {isNewAdmin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full rounded border border-charcoal/20 p-2 pr-9 text-xs text-charcoal outline-none focus:border-gold"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-mutedBrown hover:text-charcoal"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  System Role
                </label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                >
                  <option value="admin">Admin (Salon Operations)</option>
                  <option value="superadmin">Super Admin (System Owner)</option>
                </select>
              </div>
            </div>

            <div>
              <ImageUpload
                label="Admin Avatar (Cloudinary / Storage)"
                value={adminForm.avatar}
                onChange={(url, publicId) =>
                  setAdminForm({
                    ...adminForm,
                    avatar: url,
                    avatarPublicId: publicId,
                  })
                }
                folder="admins"
                aspect="square"
                helperText="JPG, PNG, or WebP portrait. Up to 5MB."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Saving…' : isNewAdmin ? 'Create Account' : 'Save Changes'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Reset Password Modal */}
      {passwordModalOpen && targetAdmin && (
        <AdminModal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          title={`Reset Password for ${targetAdmin.name}`}
          subtitle={`Account: ${targetAdmin.email}`}
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                New Password *
              </label>
              <input
                type="password"
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                required
                minLength={6}
              />
              <p className="text-[11px] text-mutedBrown mt-1">
                The password will be securely hashed with bcrypt on the server.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-charcoal px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal shadow-sm"
              >
                Update Password
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, type: null, admin: null })}
        onConfirm={confirmState.type === 'toggle' ? confirmToggleStatus : confirmDeleteAdmin}
        title={
          confirmState.type === 'toggle'
            ? confirmState.admin?.status === 'active'
              ? `Deactivate ${confirmState.admin?.name}?`
              : `Reactivate ${confirmState.admin?.name}?`
            : `Delete ${confirmState.admin?.name}'s Account?`
        }
        message={
          confirmState.type === 'toggle'
            ? confirmState.admin?.status === 'active'
              ? 'Deactivating this administrator will revoke their dashboard login immediately.'
              : 'Reactivating will restore their dashboard login access immediately.'
            : 'Are you sure you want to delete this administrator account? This action cannot be undone.'
        }
        confirmLabel={
          confirmState.type === 'toggle'
            ? confirmState.admin?.status === 'active'
              ? 'Deactivate'
              : 'Reactivate'
            : 'Delete Permanently'
        }
        confirmVariant="danger"
      />

    </div>
  )
}

