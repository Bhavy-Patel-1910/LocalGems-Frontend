import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ArrowRight, Mic, Music, Palette, Users, Zap, Shield, Award } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TalentCard from '../components/talent/TalentCard';
import api from '../services/api';

const CATEGORIES = [
  { label: 'Singers', icon: Mic, color: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/30' },
  { label: 'Dancers', icon: Zap, color: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/30' },
  { label: 'Musicians', icon: Music, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
  { label: 'Artists', icon: Palette, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
  { label: 'Coaches', icon: Award, color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
  { label: 'Speakers', icon: Users, color: 'from-brand-500/20 to-orange-500/20', border: 'border-brand-500/30' },
];

const STATS = [
  { value: '500+', label: 'Verified Talents' },
  { value: '1,200+', label: 'Bookings Done' },
  { value: '50+', label: 'Cities Covered' },
  { value: '4.8★', label: 'Avg Rating' },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredTalents, setFeaturedTalents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/talent/search?sort=-ratingAvg&limit=6');
        setFeaturedTalents(data.data.profiles);
      } catch {
        setFeaturedTalents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/talent?skill=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star size={14} className="fill-brand-400" />
            India's #1 Local Talent Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Find Local{' '}
            <span className="text-gradient">Gems</span>
            {' '}Near You
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Discover, connect, and book talented singers, dancers, artists, and coaches in your city. Fast, simple, verified.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by skill, city..."
                className="input-field pl-11 h-12"
              />
            </div>
            <button type="submit" className="btn-primary h-12 px-6 whitespace-nowrap">
              Search <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-5 text-sm text-gray-500">
            Popular:
            {['Singers', 'Dancers', 'DJs', 'Photographers'].map((t) => (
              <Link key={t} to={`/talent?skill=${t}`} className="hover:text-brand-400 transition-colors underline underline-offset-2">{t}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-dark-600 bg-dark-800/40">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-gradient mb-1">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="section-title text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ label, icon: Icon, color, border }) => (
            <Link key={label} to={`/talent?skill=${label}`}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-105 transition-all duration-200 group`}>
              <div className="w-12 h-12 bg-dark-800/60 rounded-xl flex items-center justify-center group-hover:bg-dark-700 transition-colors">
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-200">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Talent */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title mb-0">Top Rated Talent</h2>
          <Link to="/talent" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-dark-700" />
            ))}
          </div>
        ) : featuredTalents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTalents.map((p) => <TalentCard key={p._id} profile={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p>No talent profiles yet. Be the first to join!</p>
            <Link to="/register" className="btn-primary mt-4 inline-flex">Join as Talent</Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-10 text-center bg-gradient-to-br from-brand-500/10 to-orange-500/5 border-brand-500/20">
            <h2 className="text-3xl font-extrabold text-white mb-3">Are You a Talent?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your profile, get discovered, and start receiving bookings from event organizers across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=talent" className="btn-primary text-base px-8 py-3">
                Join as Talent <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=talent_provider" className="btn-secondary text-base px-8 py-3">
                I'm an Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
