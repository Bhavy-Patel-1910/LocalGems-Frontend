import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><Gem size={18} className="text-white" /></div>
          <span className="text-gradient">LocalGems</span>
        </Link>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 mb-6">
              If <span className="text-white font-medium">{email}</span> is registered, we've sent a password reset link. Check your inbox (and spam folder).
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400">No worries — enter your email and we'll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
              </button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm mt-6 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
