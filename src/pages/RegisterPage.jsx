import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Gem, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Mic, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  {
    value: 'talent',
    label: 'Talent',
    icon: Mic,
    desc: 'Singer, dancer, musician, artist, coach or any performer',
    color: 'border-brand-500 bg-brand-500/10',
    textColor: 'text-brand-400',
  },
  {
    value: 'talent_provider',
    label: 'Talent Provider',
    icon: Briefcase,
    desc: 'Event organizer, company, or individual looking to hire talent',
    color: 'border-purple-500 bg-purple-500/10',
    textColor: 'text-purple-400',
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') || '',
    phone: '',
    locationCity: '',
    locationState: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) return toast.error('Please select your role');
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login to continue.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-gradient-to-br from-dark-700 to-dark-800 border-r border-dark-600 p-10 shrink-0">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center"><Gem size={20} className="text-white" /></div>
          <span className="text-gradient">LocalGems</span>
        </Link>
        <div className="space-y-6">
          {['Create your profile in 2 minutes', 'Get discovered by event organizers', 'Receive bookings and payments online', 'Chat directly with clients'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">{i + 1}</div>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs">Free to join. No hidden fees.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><Gem size={18} className="text-white" /></div>
            <span className="text-gradient">LocalGems</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Join thousands of talented individuals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, label, icon: Icon, desc, color, textColor }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.role === value ? color : 'border-dark-500 bg-dark-700 hover:border-dark-400'}`}
                  >
                    <Icon size={20} className={form.role === value ? textColor : 'text-gray-400'} />
                    <div className={`font-semibold text-sm mt-2 ${form.role === value ? textColor : 'text-gray-200'}`}>{label}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-tight">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-field pl-11" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field pl-11" autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="input-field pl-11 pr-11" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Phone & City - Optional */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit" className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
                <div className="relative">
                  <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" name="locationCity" value={form.locationCity} onChange={handleChange} placeholder="Ahmedabad" className="input-field pl-11" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || !form.role} className="btn-primary w-full h-12 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
