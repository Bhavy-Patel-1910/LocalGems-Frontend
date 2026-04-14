import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TalentListingPage from './pages/TalentListingPage';
import TalentDetailPage from './pages/TalentDetailPage';
import UserDashboard from './pages/UserDashboard';
import TalentDashboard from './pages/TalentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import EventsPage from './pages/EventsPage';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'talent' ? '/talent/dashboard' : '/dashboard'} replace />;
  return children;
};

const AppRoutes = () => (
  <SocketProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/talent" element={<TalentListingPage />} />
      <Route path="/talent/:id" element={<TalentDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/dashboard" element={<PrivateRoute roles={['talent_provider']}><UserDashboard /></PrivateRoute>} />
      <Route path="/talent/dashboard" element={<PrivateRoute roles={['talent']}><TalentDashboard /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/chat/:userId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </SocketProvider>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#f5f5f5', border: '1px solid #3a3a3a' }, success: { iconTheme: { primary: '#f97316', secondary: '#fff' } } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
