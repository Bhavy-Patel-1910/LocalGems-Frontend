import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, Clock, ExternalLink, MessageCircle, Calendar, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function BookingModal({ talent, onClose, onSuccess }) {
  const [form, setForm] = useState({ eventTitle: '', eventDateStart: '', eventDateEnd: '', durationHours: '', amountAgreed: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventDateStart) return toast.error('Please select event date');
    setLoading(true);
    try {
      await api.post('/bookings', { ...form, talentId: talent._id });
      toast.success('Booking request sent!');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-5">Book {talent?.userId?.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Event Title</label>
            <input type="text" value={form.eventTitle} onChange={(e) => setForm({ ...form, eventTitle: e.target.value })} placeholder="Wedding reception, Corporate event..." className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Start Date & Time *</label>
              <input type="datetime-local" value={form.eventDateStart} onChange={(e) => setForm({ ...form, eventDateStart: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">End Date & Time</label>
              <input type="datetime-local" value={form.eventDateEnd} onChange={(e) => setForm({ ...form, eventDateEnd: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Duration (hours)</label>
              <input type="number" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} placeholder="e.g. 2" min="0" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Agreed Amount (₹)</label>
              <input type="number" value={form.amountAgreed} onChange={(e) => setForm({ ...form, amountAgreed: e.target.value })} placeholder="e.g. 5000" min="0" className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special requirements..." rows={3} className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TalentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, rRes] = await Promise.all([api.get(`/talent/${id}`), api.get(`/reviews/${id}`)]);
        setProfile(pRes.data.data.profile);
        setReviews(rRes.data.data.reviews);
      } catch {
        toast.error('Talent not found');
        navigate('/talent');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  const talentUser = profile.userId;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(profile.ratingAvg));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft size={18} /> Back to Talent
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="card overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-brand-500/20 to-orange-500/10">
                {talentUser?.profilePicUrl ? (
                  <img src={talentUser.profilePicUrl} alt={talentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-black text-dark-600">
                    {talentUser?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {profile.isFeatured && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Sparkles size={12} /> Featured
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">{talentUser?.name}</h1>
                    <p className="text-brand-400 font-semibold text-lg">{profile.primarySkill}</p>
                  </div>
                  <div className="text-right">
                    {profile.hourlyRateMin && (
                      <div className="text-xl font-bold text-white">
                        ₹{profile.hourlyRateMin.toLocaleString()}
                        {profile.hourlyRateMax && ` – ₹${profile.hourlyRateMax.toLocaleString()}`}
                      </div>
                    )}
                    <p className="text-gray-500 text-sm">per hour</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  {talentUser?.locationCity && (
                    <span className="flex items-center gap-1.5"><MapPin size={14} />{talentUser.locationCity}{talentUser.locationState ? `, ${talentUser.locationState}` : ''}</span>
                  )}
                  {profile.experienceYears > 0 && (
                    <span className="flex items-center gap-1.5"><Clock size={14} />{profile.experienceYears} years experience</span>
                  )}
                  {profile.ratingCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <div className="flex">{stars.map((f, i) => <Star key={i} size={13} className={f ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />)}</div>
                      {profile.ratingAvg} ({profile.ratingCount} reviews)
                    </span>
                  )}
                </div>

                {profile.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s) => (
                      <span key={s} className="badge-talent">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            {(talentUser?.bio || profile.experienceDesc) && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-white mb-3">About</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{profile.experienceDesc || talentUser?.bio}</p>
              </div>
            )}

            {/* Portfolio */}
            {profile.portfolioUrls?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-white mb-4">Portfolio</h2>
                <div className="space-y-2">
                  {profile.portfolioUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                      <ExternalLink size={14} /> {url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {profile.serviceAreas?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-white mb-3">Service Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.serviceAreas.map((area) => (
                    <span key={area} className="flex items-center gap-1 text-sm bg-dark-700 border border-dark-500 text-gray-300 px-3 py-1 rounded-full">
                      <MapPin size={12} className="text-brand-400" /> {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-dark-600 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                          {r.userId?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{r.userId?.name}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} size={11} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                            ))}
                          </div>
                        </div>
                        {r.isVerified && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12} /> Verified</span>
                        )}
                      </div>
                      {r.reviewText && <p className="text-gray-300 text-sm leading-relaxed">{r.reviewText}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-white text-lg mb-4">Book {talentUser?.name?.split(' ')[0]}</h3>

              {profile.hourlyRateMin && (
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-5">
                  <p className="text-sm text-gray-400 mb-1">Starting from</p>
                  <p className="text-2xl font-extrabold text-brand-400">₹{profile.hourlyRateMin.toLocaleString()}<span className="text-sm font-normal text-gray-400">/hr</span></p>
                </div>
              )}

              {user?.role === 'talent_provider' ? (
                <>
                  <button onClick={() => setShowBooking(true)} className="btn-primary w-full h-11 text-base mb-3">
                    <Calendar size={18} /> Book Now
                  </button>
                  <Link
                    to={`/chat/${talentUser?._id}`}
                    className="btn-secondary w-full h-11 text-base flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> Message {talentUser?.name?.split(' ')[0]}
                  </Link>
                </>
              ) : user?.role === 'talent' ? (
                /* Talent viewing another talent — just show info */
                <div className="bg-dark-700 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-400">Switch to a Talent Provider account to book talent.</p>
                </div>
              ) : (
                /* Not logged in */
                <div className="space-y-3">
                  <Link to="/login" className="btn-primary w-full h-11 text-base flex items-center justify-center gap-2">
                    <Calendar size={18} /> Login to Book
                  </Link>
                  <Link to="/login" className="btn-secondary w-full h-11 text-base flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Login to Message
                  </Link>
                </div>
              )}

              {profile.ratingCount > 0 && (
                <div className="mt-5 pt-5 border-t border-dark-600">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Rating</span>
                    <span className="text-yellow-400 font-bold">{profile.ratingAvg} ★</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 mt-1.5">
                    <span>Total reviews</span>
                    <span className="text-white">{profile.ratingCount}</span>
                  </div>
                  {profile.experienceYears > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-400 mt-1.5">
                      <span>Experience</span>
                      <span className="text-white">{profile.experienceYears} years</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBooking && <BookingModal talent={profile} onClose={() => setShowBooking(false)} onSuccess={() => { setShowBooking(false); navigate('/dashboard'); }} />}
      <Footer />
    </div>
  );
}
