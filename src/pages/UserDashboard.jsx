import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, Star, Clock, CheckCircle, XCircle, AlertCircle, Plus, User } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  rejected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', { bookingId: booking._id, rating, reviewText: text });
      toast.success('Review submitted!');
      onSubmit();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">Write a Review</h2>
        <p className="text-gray-400 text-sm mb-5">For: {booking.talentId?.userId?.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                  <Star size={28} className={(hover || rating) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Review (optional)</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Share your experience..." className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/user');
      setBookings(data.data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    }
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter((b) => b.status === activeTab);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-brand-400">{user?.name}</span></p>
          </div>
          <div className="flex gap-3">
            <Link to="/chat" className="btn-secondary text-sm h-10 px-4"><MessageCircle size={16} /> Messages</Link>
            <Link to="/talent" className="btn-primary text-sm h-10 px-4"><Plus size={16} /> Book Talent</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'text-brand-400' },
            { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'text-yellow-400' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-blue-400' },
            { label: 'Completed', value: stats.completed, icon: Star, color: 'text-green-400' },
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

        {/* Bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">My Bookings</h2>
            <div className="flex bg-dark-700 rounded-xl p-1 gap-1">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-dark-700 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={40} className="mx-auto mb-3 opacity-20" />
              <p>No bookings yet.</p>
              <Link to="/talent" className="btn-primary mt-4 inline-flex text-sm">Find Talent</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => {
                const talent = booking.talentId;
                const talentUser = talent?.userId;
                return (
                  <div key={booking._id} className="bg-dark-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg shrink-0">
                        {talentUser?.name?.[0]?.toUpperCase() || 'T'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{talentUser?.name || 'Unknown Talent'}</p>
                        <p className="text-sm text-gray-400">{booking.eventTitle || talent?.primarySkill}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> {new Date(booking.eventDateStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {booking.amountAgreed > 0 && (
                        <span className="text-sm font-bold text-white">₹{booking.amountAgreed.toLocaleString()}</span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[booking.status]}`}>
                        {booking.status}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/chat/${talentUser?._id}`} className="btn-ghost p-2 text-xs"><MessageCircle size={15} /></Link>
                        {booking.status === 'completed' && (
                          <button onClick={() => setReviewBooking(booking)} className="btn-ghost p-2 text-xs text-yellow-400"><Star size={15} /></button>
                        )}
                        {booking.status === 'pending' && (
                          <button onClick={() => handleCancel(booking._id)} className="btn-ghost p-2 text-xs text-red-400"><XCircle size={15} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewBooking && (
        <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmit={() => { setReviewBooking(null); fetchBookings(); }} />
      )}
    </div>
  );
}
