import React from 'react';
import { FaSearch, FaEllipsisV } from 'react-icons/fa';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'scrum_master' | 'employee';
  avatar?: string;
  date_joined: string;
}

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onMenuClick }) => {
  return (
    <div className="navbar">
      <div className="navbar-brand">
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            marginRight: '16px',
            display: 'none'
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'white', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e3a8a',
            fontWeight: 'bold'
          }}>
            🚀
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>Teams in Space</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Software project</div>
          </div>
        </div>
      </div>
      
      <div className="navbar-actions">
        <button
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Release
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
