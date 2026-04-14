import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, IndianRupee, Plus, X, ChevronRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const SKILL_CATEGORIES = ['Singer', 'Dancer', 'Musician', 'DJ', 'Artist', 'Coach', 'Photographer', 'Speaker', 'Comedian', 'Other'];

function PostEventModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', skillCategory: '', eventDate: '', durationHours: '', budgetMin: '', budgetMax: '', location: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/events', form);
      toast.success('Event posted successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Post an Event</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Event Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Wedding reception, Corporate event..." className="input-field" required />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What kind of performance do you need?" className="input-field resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Skill Needed *</label>
              <select value={form.skillCategory} onChange={(e) => setForm({ ...form, skillCategory: e.target.value })} className="input-field" required>
                <option value="">Select skill</option>
                {SKILL_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Event Date *</label>
              <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Duration (hrs)</label>
              <input type="number" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} placeholder="2" min="0" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Budget Min (₹)</label>
              <input type="number" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} placeholder="2000" min="0" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Budget Max (₹)</label>
              <input type="number" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} placeholder="8000" min="0" className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ahmedabad, Gujarat" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Post Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplyModal({ event, onClose, onSuccess }) {
  const [form, setForm] = useState({ proposedRate: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/events/${event._id}/apply`, form);
      toast.success('Application submitted!');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">Apply for Event</h2>
        <p className="text-sm text-gray-400 mb-5">{event.title}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Your Rate (₹)</label>
            <input type="number" value={form.proposedRate} onChange={(e) => setForm({ ...form, proposedRate: e.target.value })} placeholder="e.g. 3000" min="0" className="input-field" />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Message to Organizer</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Introduce yourself and why you're a good fit..." className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [applyEvent, setApplyEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.data.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Open Events</h1>
            <p className="text-gray-400 mt-1">Gig opportunities posted by event organizers</p>
          </div>
          {user?.role === 'talent_provider' && (
            <button onClick={() => setShowPost(true)} className="btn-primary h-11 px-5">
              <Plus size={18} /> Post Event
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-dark-700 animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No open events right now</p>
            {user?.role === 'talent_provider' && (
              <button onClick={() => setShowPost(true)} className="btn-primary mt-5">Post the First Event</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="card p-6 hover:border-brand-500/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold text-white text-lg">{event.title}</h3>
                      <span className="badge-talent">{event.skillCategory}</span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">{event.status}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      {event.eventDate && (
                        <span className="flex items-center gap-1.5"><Calendar size={14} />{new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      {event.durationHours && (
                        <span className="flex items-center gap-1.5"><Clock size={14} />{event.durationHours} hours</span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1.5"><MapPin size={14} />{event.location}</span>
                      )}
                      {(event.budgetMin || event.budgetMax) && (
                        <span className="flex items-center gap-1.5 text-brand-400 font-medium">
                          <IndianRupee size={14} />
                          {event.budgetMin && event.budgetMax ? `${event.budgetMin.toLocaleString()} – ${event.budgetMax.toLocaleString()}` : (event.budgetMin || event.budgetMax)?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{event.applications?.length || 0} applicants</p>
                      <p className="text-xs text-gray-500 mt-1">By {event.userId?.name}</p>
                    </div>
                    {user?.role === 'talent' && event.status === 'open' && (
                      <button onClick={() => setApplyEvent(event)} className="btn-primary text-sm h-10 px-4">
                        Apply <ChevronRight size={15} />
                      </button>
                    )}
                    {!user && (
                      <a href="/login" className="btn-secondary text-sm h-10 px-4 flex items-center justify-center gap-1">
                        Login to Apply
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPost && <PostEventModal onClose={() => setShowPost(false)} onSuccess={() => { setShowPost(false); fetchEvents(); }} />}
      {applyEvent && <ApplyModal event={applyEvent} onClose={() => setApplyEvent(null)} onSuccess={() => { setApplyEvent(null); fetchEvents(); }} />}
      <Footer />
    </div>
  );
}
