import React from 'react';

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">⚡</div>
        <div>
          <div className="navbar-title">SILENT QUEUE</div>
          <div className="navbar-subtitle">AI Queue Intelligence Platform</div>
        </div>
      </div>
      <div className="navbar-right">
        <div className="live-badge">
          <span className="live-dot" />
          LIVE
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
