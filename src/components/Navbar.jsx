import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';

export default function Navbar() {
  const location = useLocation();
  const { match } = useMatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  
  const handleLinkClick = () => setIsMenuOpen(false);
  
  return (
    <nav style={{ backgroundColor: '#111835' }} className="shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="text-xl font-bold" style={{ color: '#f8d613' }}>
              🏐 VolleyTracker
            </Link>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md focus:outline-none"
              style={{ color: '#fbfcfc' }}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
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
        
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: '#f8d61330' }}>
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                onClick={handleLinkClick}
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
                onClick={handleLinkClick}
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
                onClick={handleLinkClick}
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
        )}
      </div>
    </nav>
  );
}