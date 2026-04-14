import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Sparkles } from 'lucide-react';

export default function TalentCard({ profile }) {
  const user = profile.userId;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(profile.ratingAvg));

  return (
    <Link to={`/talent/${profile._id}`} className="card hover:border-brand-500/50 transition-all duration-300 overflow-hidden group block">
      <div className="relative h-40 bg-gradient-to-br from-dark-700 to-dark-600 overflow-hidden">
        {user?.profilePicUrl ? (
          <img src={user.profilePicUrl} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-dark-500">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        )}
        {profile.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            <Sparkles size={10} /> Featured
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-brand-400 transition-colors">{user?.name}</h3>
            <p className="text-brand-400 text-sm font-medium">{profile.primarySkill}</p>
          </div>
          <div className="text-right">
            {profile.hourlyRateMin && (
              <p className="text-white font-bold text-sm">₹{profile.hourlyRateMin.toLocaleString()}</p>
            )}
            <p className="text-gray-500 text-xs">per hour</p>
          </div>
        </div>

        {profile.ratingCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {stars.map((filled, i) => (
                <Star key={i} size={12} className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
            <span className="text-xs text-gray-400">{profile.ratingAvg} ({profile.ratingCount})</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {user?.locationCity && (
            <span className="flex items-center gap-1"><MapPin size={11} />{user.locationCity}</span>
          )}
          {profile.experienceYears > 0 && (
            <span className="flex items-center gap-1"><Clock size={11} />{profile.experienceYears}y exp</span>
          )}
        </div>

        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-xs bg-dark-700 border border-dark-500 text-gray-300 px-2 py-0.5 rounded-full">{skill}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
