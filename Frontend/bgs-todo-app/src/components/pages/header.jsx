import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, CheckSquare, User, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
import '../assets/css/header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "You have 3 tasks due today", read: false },
    { id: 2, message: "Welcome to BGS Todo App!", read: true }
  ]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <CheckSquare size={24} className="logo-icon" />
          <Link to="/" className="logo-text">BGS Todo App</Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation links */}
        <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActivePage('/') ? 'active' : ''}`}>
              Dashboard
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/task" className={`nav-link ${isActivePage('/task') ? 'active' : ''}`}>
                  My Tasks
                </Link>
                <Link to="/categories" className={`nav-link ${isActivePage('/categories') ? 'active' : ''}`}>
                  Categories
                </Link>
              </>
            )}
            <Link to="/about" className={`nav-link ${isActivePage('/about') ? 'active' : ''}`}>
              About
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="user-section">
              {/* Theme toggle */}
              <div className="theme-toggle">
                <button 
                  className="theme-toggle-button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>

              {/* Notifications */}
              <div className="notification-container">
                <button 
                  className="notification-button"
                  onClick={() => setDropdownOpen(dropdownOpen === 'notifications' ? false : 'notifications')}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {getUnreadCount() > 0 && (
                    <span className="notification-badge">{getUnreadCount()}</span>
                  )}
                </button>

                {dropdownOpen === 'notifications' && (
                  <div className="dropdown-menu notifications-dropdown" ref={dropdownRef}>
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      {getUnreadCount() > 0 && (
                        <button className="mark-read-btn" onClick={markAllAsRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="notification-list">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          >
                            {notification.message}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-notifications">
                        No notifications
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="user-menu">
                <button 
                  className="user-menu-button"
                  onClick={() => setDropdownOpen(dropdownOpen === 'userMenu' ? false : 'userMenu')}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user?.username || 'User'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="username">{user?.username || 'User'}</span>
                </button>

                {dropdownOpen === 'userMenu' && (
                  <div className="dropdown-menu user-dropdown" ref={dropdownRef}>
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user?.username || 'User'} />
                        ) : (
                          <div className="avatar-placeholder large">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="dropdown-user-details">
                        <p className="dropdown-username">{user?.username || 'User'}</p>
                        <p className="dropdown-email">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                    
                    <div className="dropdown-menu-items">
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item logout">
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className={`auth-link ${isActivePage('/login') ? 'active' : ''}`}>Login</Link>
              <Link to="/register" className="auth-link register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;