import { Link } from 'react-router-dom';
import { Gem, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><Gem size={18} className="text-white" /></div>
              <span className="text-gradient">LocalGems</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Connecting talented performers with event organizers across India. Find your perfect local artist today.
            </p>
            <div className="flex gap-3 mt-4">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-dark-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-400 hover:bg-dark-600 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
            <div className="space-y-2.5">
              {[['Discover Talent', '/talent'], ['Post an Event', '/events'], ['How it Works', '/']].map(([label, to]) => (
                <Link key={to} to={to} className="block text-gray-400 hover:text-brand-400 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <div className="space-y-2.5">
              {['About', 'Privacy', 'Terms', 'Contact'].map((item) => (
                <a key={item} href="#" className="block text-gray-400 hover:text-brand-400 text-sm transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-dark-600 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2024 LocalGems. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
