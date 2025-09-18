import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaColumns, 
  FaChartBar, 
  FaRocket, 
  FaCube, 
  FaCheckSquare, 
  FaCode, 
  FaPlus, 
  FaCog, 
  FaQuestionCircle 
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/board/1', icon: FaColumns, label: 'Board' },
    { path: '/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/releases', icon: FaRocket, label: 'Releases' },
    { path: '/components', icon: FaCube, label: 'Components' },
    { path: '/issues', icon: FaCheckSquare, label: 'Issues' },
    { path: '/repository', icon: FaCode, label: 'Repository' },
    { path: '/add-item', icon: FaPlus, label: 'Add Item' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'block'
          }}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaRocket />
          </div>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
            Teams in Space
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '4px 0 0 0' }}>
            Software project
          </p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/board/1' && location.pathname.startsWith('/board/'));
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={isActive ? 'active' : ''}
                    onClick={onClose}
                  >
                    <Icon className="sidebar-nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px',
          right: '20px'
        }}>
          <button
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              margin: '0 auto'
            }}
          >
            <FaQuestionCircle />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
