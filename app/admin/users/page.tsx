'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { User, UserRole } from '@/lib/types';
import { Users, Shield, Wrench, Plus } from 'lucide-react';
import { useAdminCreateUser } from '@/lib/auth-hooks';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { adminCreateUser, loading: createLoading } = useAdminCreateUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'complainer' as UserRole,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(u => u.role === roleFilter);

  const roleStats = {
    total: users.length,
    complainer: users.filter(u => u.role === 'complainer').length,
    technician: users.filter(u => u.role === 'technician').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'technician':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'technician':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await adminCreateUser(formData.email, formData.password, formData.name, formData.role);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'complainer' });
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async function fetchUsers() {
    try {
      const db = getDbInstance();
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as User[];
      setUsers(userData);
    } catch (error) {
      console.error('[v0] Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">User Management</h2>
          <p className="text-gray-400 mt-2">View and manage system users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{roleStats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Complainers</p>
          <p className="text-3xl font-bold text-blue-600">{roleStats.complainer}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Technicians</p>
          <p className="text-3xl font-bold text-green-600">{roleStats.technician}</p>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Admins</p>
          <p className="text-3xl font-bold text-purple-600">{roleStats.admin}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('complainer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                roleFilter === 'complainer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Complainers ({roleStats.complainer})
            </button>
            <button
              onClick={() => setRoleFilter('technician')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                roleFilter === 'technician'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Technicians ({roleStats.technician})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admins ({roleStats.admin})
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-gray-600 p-6 text-center">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
              <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new user account</p>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-gray-600">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="complainer">Ticket Creator (Complainer)</option>
                  <option value="technician">Support Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
