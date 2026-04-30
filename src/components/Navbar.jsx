import { Link, useLocation } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';

export default function Navbar() {
  const location = useLocation();
  const { match } = useMatch();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav style={{ backgroundColor: '#111835' }} className="shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold" style={{ color: '#f8d613' }}>
              🏐 VolleyTracker
            </Link>
            
            <div className="flex space-x-4">
              <Link 
                to="/" 
                className="px-3 py-2 rounded-md text-sm font-medium transition"
                style={{
                  backgroundColor: isActive('/') ? '#0248c1' : 'transparent',
                  color: isActive('/') ? '#fbfcfc' : '#fbfcfc',
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.backgroundColor = '#f8d613';
                    e.currentTarget.style.color = '#111835';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#fbfcfc';
                  }
                }}
              >
                Setup
              </Link>
              <Link 
                to="/match" 
                className="px-3 py-2 rounded-md text-sm font-medium transition flex items-center"
                style={{
                  backgroundColor: isActive('/match') ? '#0248c1' : 'transparent',
                  color: isActive('/match') ? '#fbfcfc' : '#fbfcfc',
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/match')) {
                    e.currentTarget.style.backgroundColor = '#f8d613';
                    e.currentTarget.style.color = '#111835';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/match')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#fbfcfc';
                  }
                }}
              >
                Match
                {match && <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
              </Link>
              <Link 
                to="/analytics" 
                className="px-3 py-2 rounded-md text-sm font-medium transition"
                style={{
                  backgroundColor: isActive('/analytics') ? '#0248c1' : 'transparent',
                  color: isActive('/analytics') ? '#fbfcfc' : '#fbfcfc',
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/analytics')) {
                    e.currentTarget.style.backgroundColor = '#f8d613';
                    e.currentTarget.style.color = '#111835';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/analytics')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#fbfcfc';
                  }
                }}
              >
                Analytics
              </Link>
            </div>
          </div>
          
          {match && (
            <div className="text-sm" style={{ color: '#fbfcfc' }}>
              Live: {match.homeTeam.name} vs {match.awayTeam.name}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}