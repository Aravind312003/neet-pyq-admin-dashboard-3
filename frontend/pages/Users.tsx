import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon,
  Search,
  UserPlus,
  Shield,
  User,
  Activity,
  Mail,
  Key,
  Trash2,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { UserProfile } from '../types';
import Modal from '../components/Modal';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals & User actions
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'admin'>('student');
  const [submitting, setSubmitting] = useState(false);

  // User Profile Drawer/Modal
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Deletion Modal
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const endpoints = [
      `${API_BASE_URL}/api/admin/users`,
      `${API_BASE_URL}/admin/users`
    ];

    let response: Response | null = null;

    try {
      setLoading(true);
      setError('');

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.status !== 404) {
            response = res;
            break;
          }
        } catch (e) {
          console.warn(`Attempt failed for ${url}:`, e);
        }
      }

      if (!response) {
        setUsers([]);
        setLoading(false);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch user directory');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!newEmail || !newPassword) {
      setError('Email and initial password are required.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          role: newRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`User ${newEmail} created successfully.`);
        setIsAddUserOpen(false);
        setNewEmail('');
        setNewName('');
        setNewPassword('');
        setNewRole('student');
        fetchUsers();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ disabled: !user.disabled })
      });

      if (res.ok) {
        setSuccessMsg(`User ${user.email} status updated.`);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error(err);
      setError('Error toggling user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccessMsg(`User ${deletingUser.email} deleted successfully.`);
        setDeletingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting user');
    }
  };

  const viewProfile = async (userId: string) => {
    setActiveProfileId(userId);
    setProfileData(null);
    setProfileLoading(true);

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !u.disabled) ||
      (statusFilter === 'suspended' && u.disabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            User Management Directory
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage student registrations, admin credentials, access permissions, and session activity.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users by email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${roleFilter === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'}`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${roleFilter === 'student' ? 'bg-white dark:bg-neutral-700 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'}`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${roleFilter === 'admin' ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'}`}
            >
              Admins
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${statusFilter === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'}`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${statusFilter === 'active' ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${statusFilter === 'suspended' ? 'bg-white dark:bg-neutral-700 text-red-600 dark:text-red-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'}`}
            >
              Suspended
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
            <p className="text-xs text-neutral-500">Loading user database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <UsersIcon className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No users match criteria</h3>
            <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                          {(u.email || 'U').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{u.email}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                      }`}>
                        {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {u.role === 'admin' ? 'Administrator' : 'Student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        u.disabled
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.disabled ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {u.disabled ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewProfile(u.id)}
                          className="p-1.5 text-neutral-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                          title="View Profile Analytics"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.disabled
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                          title={u.disabled ? 'Re-activate Account' : 'Suspend Account'}
                        >
                          {u.disabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Register New Account
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Create user credentials directly in the administrative database.</p>

            <form onSubmit={handleAddUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="student@neet.ac.in"
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole('student')}
                    className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                      newRole === 'student'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                      newRole === 'admin'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {activeProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-lg w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveProfileId(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              User Profile & Activity
            </h3>

            {profileLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
                <p className="text-xs text-neutral-500">Fetching student progress record...</p>
              </div>
            ) : profileData ? (
              <div className="mt-4 space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-sm uppercase">
                    {(profileData.user?.email || 'U').substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{profileData.user?.email}</h4>
                    <p className="text-[11px] text-neutral-500">
                      Role: {profileData.user?.role} | Created: {profileData.user?.created_at ? new Date(profileData.user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase">Tests Attempted</p>
                    <p className="text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">{profileData.attemptsCount || 0}</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase">Average Score</p>
                    <p className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">{profileData.averageScore || 0}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-6">No detailed profile data available.</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account ${deletingUser?.email}? This action cannot be undone.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
}