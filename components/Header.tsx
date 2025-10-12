import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkStyle = {
    textDecoration: 'underline',
    textUnderlineOffset: '6px',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <Link to="/" className="text-xl font-bold tracking-widest uppercase">
          FashionForward
        </Link>
        <nav className="flex items-center space-x-8 text-sm font-medium tracking-wider uppercase">
          <NavLink 
            to="/dashboard"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="hover:text-gray-500 transition-colors duration-300"
          >
            Stylist + Dashboard
          </NavLink>
          <NavLink 
            to="/seasonal-forecast"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="hover:text-gray-500 transition-colors duration-300"
          >
            Seasonal Forecast
          </NavLink>
          <NavLink 
            to="/sustainability"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="hover:text-gray-500 transition-colors duration-300"
          >
            Sustainability
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;