import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TalentCard from '../components/talent/TalentCard';
import api from '../services/api';

const SKILLS = ['Singer', 'Dancer', 'Musician', 'DJ', 'Artist', 'Coach', 'Speaker', 'Photographer', 'Comedian'];

export default function TalentListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    skill: searchParams.get('skill') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    maxRate: searchParams.get('maxRate') || '',
    page: 1,
  });

  const fetchTalents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.skill) params.set('skill', filters.skill);
      if (filters.city) params.set('city', filters.city);
      if (filters.minRating) params.set('minRating', filters.minRating);
      if (filters.maxRate) params.set('maxRate', filters.maxRate);
      params.set('page', filters.page);
      params.set('limit', 12);

      const { data } = await api.get(`/talent/search?${params}`);
      setProfiles(data.data.profiles);
      setPagination(data.data.pagination);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTalents(); }, [filters]);

  const handleFilterChange = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ skill: '', city: '', minRating: '', maxRate: '', page: 1 });

  const activeFilters = [filters.skill, filters.city, filters.minRating, filters.maxRate].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Discover Talent</h1>
          <p className="text-gray-400">Find the perfect artist or performer for your next event</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="card p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Filters</h3>
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Skill / Category</label>
                <div className="space-y-1.5">
                  {SKILLS.map((s) => (
                    <button key={s} onClick={() => handleFilterChange('skill', filters.skill === s ? '' : s)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.skill === s ? 'bg-brand-500/20 text-brand-400 font-medium' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">City</label>
                <input type="text" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} placeholder="e.g. Ahmedabad" className="input-field text-sm py-2" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Min Rating</label>
                <div className="grid grid-cols-4 gap-1">
                  {[3, 4, 4.5, 5].map((r) => (
                    <button key={r} onClick={() => handleFilterChange('minRating', filters.minRating == r ? '' : r)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.minRating == r ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
                      {r}+
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Max Rate (₹/hr)</label>
                <input type="number" value={filters.maxRate} onChange={(e) => handleFilterChange('maxRate', e.target.value)} placeholder="e.g. 5000" className="input-field text-sm py-2" />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar + Mobile Filter Toggle */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={filters.skill} onChange={(e) => handleFilterChange('skill', e.target.value)}
                  placeholder="Search by skill, name..." className="input-field pl-11 h-11" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden btn-secondary h-11 px-4 relative ${activeFilters > 0 ? 'border-brand-500 text-brand-400' : ''}`}>
                <SlidersHorizontal size={18} />
                {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white">{activeFilters}</span>}
              </button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden card p-4 mb-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">City</label>
                  <input type="text" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} placeholder="City" className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Max Rate (₹)</label>
                  <input type="number" value={filters.maxRate} onChange={(e) => handleFilterChange('maxRate', e.target.value)} placeholder="Max rate" className="input-field text-sm py-2" />
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">
                {loading ? 'Loading...' : `${pagination.total || profiles.length} talents found`}
              </p>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card h-64 animate-pulse bg-dark-700" />
                ))}
              </div>
            ) : profiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {profiles.map((p) => <TalentCard key={p._id} profile={p} />)}
                </div>
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${filters.page === p ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No talent found</p>
                <p className="text-sm mt-1">Try different filters or search terms</p>
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="btn-primary mt-5 text-sm">Clear Filters</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
