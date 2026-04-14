import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, Star, CheckCircle, XCircle, Clock, Edit3, Eye, Plus, AlertCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  rejected: 'bg-gray-500/20 text-gray-400',
};

const PROFILE_STATUS_STYLES = {
  draft: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

function ProfileForm({ profile, onSave }) {
  const [form, setForm] = useState({
    primarySkill: profile?.primarySkill || '',
    skills: profile?.skills?.join(', ') || '',
    experienceYears: profile?.experienceYears || '',
    experienceDesc: profile?.experienceDesc || '',
    hourlyRateMin: profile?.hourlyRateMin || '',
    hourlyRateMax: profile?.hourlyRateMax || '',
    portfolioUrls: profile?.portfolioUrls?.join('\n') || '',
    serviceAreas: profile?.serviceAreas?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        portfolioUrls: form.portfolioUrls.split('\n').map((u) => u.trim()).filter(Boolean),
        serviceAreas: form.serviceAreas.split(',').map((a) => a.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears) || 0,
        hourlyRateMin: Number(form.hourlyRateMin) || 0,
        hourlyRateMax: Number(form.hourlyRateMax) || 0,
      };
      await api.post('/talent/profile', payload);
      toast.success('Profile saved & submitted for review!');
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-300 mb-1.5 block">Primary Skill *</label>
          <input type="text" value={form.primarySkill} onChange={(e) => setForm({ ...form, primarySkill: e.target.value })} placeholder="e.g. Singer" className="input-field" required />
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-1.5 block">Years of Experience</label>
          <input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} placeholder="e.g. 5" min="0" className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-300 mb-1.5 block">All Skills (comma-separated)</label>
        <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Bollywood, Classical, Jazz" className="input-field" />
      </div>
      <div>
        <label className="text-sm text-gray-300 mb-1.5 block">About / Experience Description</label>
        <textarea value={form.experienceDesc} onChange={(e) => setForm({ ...form, experienceDesc: e.target.value })} rows={4} placeholder="Describe your experience, style, and what makes you unique..." className="input-field resize-none" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-300 mb-1.5 block">Min Rate (₹/hr)</label>
          <input type="number" value={form.hourlyRateMin} onChange={(e) => setForm({ ...form, hourlyRateMin: e.target.value })} placeholder="e.g. 2000" min="0" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-1.5 block">Max Rate (₹/hr)</label>
          <input type="number" value={form.hourlyRateMax} onChange={(e) => setForm({ ...form, hourlyRateMax: e.target.value })} placeholder="e.g. 8000" min="0" className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-300 mb-1.5 block">Portfolio URLs (one per line)</label>
        <textarea value={form.portfolioUrls} onChange={(e) => setForm({ ...form, portfolioUrls: e.target.value })} rows={3} placeholder="https://youtube.com/..." className="input-field resize-none text-sm" />
      </div>
      <div>
        <label className="text-sm text-gray-300 mb-1.5 block">Service Areas (comma-separated)</label>
        <input type="text" value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} placeholder="Ahmedabad, Surat, Mumbai" className="input-field" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto h-11 px-8">
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save & Submit for Review'}
      </button>
    </form>
  );
}

export default function TalentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([api.get('/talent/me'), api.get('/bookings/user')]);
      setProfile(pRes.data.data.profile);
      setBookings(bRes.data.data.bookings);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    earnings: bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.amountAgreed || 0), 0),
  };

  const TABS = ['overview', 'bookings', 'profile'];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Talent Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome, <span className="text-brand-400">{user?.name}</span></p>
          </div>
          <div className="flex gap-3">
            <Link to="/chat" className="btn-secondary text-sm h-10 px-4"><MessageCircle size={16} /> Messages</Link>
            {profile && <Link to={`/talent/${profile._id}`} className="btn-ghost text-sm h-10 px-4"><Eye size={16} /> View Profile</Link>}
          </div>
        </div>

        {/* Profile Status Banner */}
        {profile && (
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
            profile.profileStatus === 'approved' ? 'bg-green-500/10 border-green-500/30' :
            profile.profileStatus === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' :
            profile.profileStatus === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
            'bg-dark-700 border-dark-500'
          }`}>
            {profile.profileStatus === 'approved' ? <CheckCircle size={20} className="text-green-400 shrink-0" /> :
             profile.profileStatus === 'pending' ? <AlertCircle size={20} className="text-yellow-400 shrink-0" /> :
             <XCircle size={20} className="text-red-400 shrink-0" />}
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">
                Profile Status:{' '}
                <span className={
                  profile.profileStatus === 'approved' ? 'text-green-400' :
                  profile.profileStatus === 'pending' ? 'text-yellow-400' :
                  profile.profileStatus === 'rejected' ? 'text-red-400' : 'text-gray-400'
                }>
                  {profile.profileStatus === 'approved' ? '✅ Live & Visible' :
                   profile.profileStatus === 'pending' ? '⏳ Pending Review' :
                   profile.profileStatus === 'rejected' ? '❌ Rejected' : '📝 Draft'}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {profile.profileStatus === 'approved' && 'Your profile is live! Talent providers can see and book you.'}
                {profile.profileStatus === 'pending' && 'Your profile is under review. Usually takes 24-48 hours.'}
                {profile.profileStatus === 'rejected' && 'Your profile was rejected. Update it and resubmit.'}
                {profile.profileStatus === 'draft' && 'Complete your profile and submit it for review.'}
              </p>
            </div>
            {profile.profileStatus === 'approved' && (
              <Link to={`/talent/${profile._id}`} className="btn-secondary text-xs h-8 px-3 shrink-0">
                <Eye size={13} /> View Live
              </Link>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Requests', value: stats.total, icon: Calendar, color: 'text-brand-400' },
                { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'text-yellow-400' },
                { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-blue-400' },
                { label: 'Earnings', value: `₹${stats.earnings.toLocaleString()}`, icon: Star, color: 'text-green-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={20} className={color} />
                    <span className="text-2xl font-extrabold text-white">{value}</span>
                  </div>
                  <p className="text-sm text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Pending bookings */}
            {stats.pending > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-white mb-4">Pending Requests ({stats.pending})</h3>
                <div className="space-y-3">
                  {bookings.filter((b) => b.status === 'pending').map((b) => (
                    <div key={b._id} className="bg-dark-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{b.userId?.name}</p>
                        <p className="text-sm text-gray-400">{b.eventTitle || 'Booking Request'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock size={11} />{new Date(b.eventDateStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {b.amountAgreed > 0 && ` · ₹${b.amountAgreed.toLocaleString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/chat/${b.userId?._id}`} className="btn-ghost p-2"><MessageCircle size={16} /></Link>
                        <button onClick={() => handleBookingStatus(b._id, 'rejected')} className="btn-ghost p-2 text-red-400"><XCircle size={16} /></button>
                        <button onClick={() => handleBookingStatus(b._id, 'confirmed')} className="btn-primary py-2 px-4 text-sm"><CheckCircle size={15} /> Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-5">All Booking Requests</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                <p>No booking requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b._id} className="bg-dark-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                        {b.userId?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{b.userId?.name}</p>
                        <p className="text-sm text-gray-400">{b.eventTitle || 'Booking'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock size={11} />{new Date(b.eventDateStart).toLocaleDateString('en-IN')}
                          {b.amountAgreed > 0 && ` · ₹${b.amountAgreed.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                      <Link to={`/chat/${b.userId?._id}`} className="btn-ghost p-2"><MessageCircle size={16} /></Link>
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => handleBookingStatus(b._id, 'rejected')} className="btn-ghost p-2 text-red-400 text-xs">Reject</button>
                          <button onClick={() => handleBookingStatus(b._id, 'confirmed')} className="btn-primary py-2 px-3 text-xs">Accept</button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => handleBookingStatus(b._id, 'completed')} className="btn-primary py-2 px-3 text-xs bg-green-600 hover:bg-green-700">Mark Done</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{profile ? 'Edit Profile' : 'Create Your Profile'}</h2>
              {!profile && <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">Profile needed to receive bookings</span>}
            </div>
            <ProfileForm profile={profile} onSave={fetchData} />
          </div>
        )}
      </div>
    </div>
  );
}
