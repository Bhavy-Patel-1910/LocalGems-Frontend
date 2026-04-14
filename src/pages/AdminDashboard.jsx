import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, CheckCircle, XCircle, Star, Sparkles, Eye } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = ['analytics', 'pending', 'users'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    const { data } = await api.get('/admin/analytics');
    setAnalytics(data.data);
  };

  const fetchPending = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/talent/pending');
    setPending(data.data.profiles);
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users');
    setUsers(data.data.users);
    setLoading(false);
  };

  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => {
    if (activeTab === 'pending') fetchPending();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleProfileStatus = async (id, status) => {
    try {
      await api.put(`/admin/talent/${id}/status`, { status });
      toast.success(`Profile ${status}`);
      fetchPending();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      await api.put(`/admin/talent/${id}/feature`);
      toast.success('Updated featured status');
      fetchPending();
    } catch {}
  };

  const handleToggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      toast.success('User status toggled');
      fetchUsers();
    } catch {}
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform management and moderation</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab === 'analytics' && <BarChart3 size={15} />}
              {tab === 'pending' && <><CheckCircle size={15} /> {pending.length > 0 ? `(${pending.length})` : ''}</>}
              {tab === 'users' && <Users size={15} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Analytics */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: analytics.totalUsers, color: 'text-brand-400' },
                { label: 'Talents', value: analytics.totalTalents, color: 'text-purple-400' },
                { label: 'Providers', value: analytics.totalProviders, color: 'text-blue-400' },
                { label: 'Total Bookings', value: analytics.totalBookings, color: 'text-green-400' },
                { label: 'Completed', value: analytics.completedBookings, color: 'text-emerald-400' },
                { label: 'Pending Reviews', value: analytics.pendingProfiles, color: 'text-yellow-400' },
                { label: 'Platform Revenue', value: `₹${(analytics.totalRevenue || 0).toLocaleString()}`, color: 'text-brand-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-5">
                  <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                  <p className="text-sm text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Profiles */}
        {activeTab === 'pending' && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Pending Profile Reviews ({pending.length})</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-dark-700 animate-pulse" />)}</div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                <p>No pending profiles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((profile) => (
                  <div key={profile._id} className="bg-dark-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg shrink-0">
                        {profile.userId?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{profile.userId?.name}</p>
                        <p className="text-brand-400 text-sm font-medium">{profile.primarySkill}</p>
                        <p className="text-xs text-gray-500">{profile.userId?.locationCity} · {profile.userId?.email}</p>
                        <p className="text-xs text-gray-600 mt-1">Submitted {new Date(profile.updatedAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/talent/${profile._id}`} target="_blank" className="btn-ghost p-2 text-xs" title="View Profile">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => handleToggleFeature(profile._id)} className={`btn-ghost p-2 ${profile.isFeatured ? 'text-yellow-400' : ''}`} title="Toggle Featured">
                        <Sparkles size={16} />
                      </button>
                      <button onClick={() => handleProfileStatus(profile._id, 'rejected')} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">
                        <XCircle size={15} /> Reject
                      </button>
                      <button onClick={() => handleProfileStatus(profile._id, 'approved')} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm hover:bg-green-500/30 transition-colors">
                        <CheckCircle size={15} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-5">All Users ({users.length})</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-dark-700 animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-dark-600">
                      <th className="text-left pb-3 font-medium">Name</th>
                      <th className="text-left pb-3 font-medium">Email</th>
                      <th className="text-left pb-3 font-medium">Role</th>
                      <th className="text-left pb-3 font-medium">City</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-left pb-3 font-medium">Joined</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-dark-700/50 transition-colors">
                        <td className="py-3 font-medium text-white">{u.name}</td>
                        <td className="py-3 text-gray-400">{u.email}</td>
                        <td className="py-3">
                          <span className={u.role === 'talent' ? 'badge-talent' : 'badge-provider'}>
                            {u.role === 'talent' ? 'Talent' : 'Provider'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">{u.locationCity || '—'}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-3">
                          <button onClick={() => handleToggleUser(u._id)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
