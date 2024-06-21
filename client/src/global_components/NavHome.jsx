import React from 'react';
import { Link } from 'react-router-dom';

const NavHome = () => {
  return (
    <nav style={{ backgroundColor: '#2d3748', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        Dialogue
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '32px' }}>
        <Link to="/home" style={{ color: 'white', textDecoration: 'none', hover: { color: '#a0aec0' } }}>
          Home
        </Link>
        <Link to="/events" style={{ color: 'white', textDecoration: 'none', hover: { color: '#a0aec0' } }}>
          Events
        </Link>
        <Link to="/conversations" style={{ color: 'white', textDecoration: 'none', hover: { color: '#a0aec0' } }}>
          Conversations
        </Link>
      </div>
    </nav>
  );
};

export default NavHome;
