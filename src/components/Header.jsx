// components/Header.jsx

import React from 'react';
import './Header.css';

const Header = ({ darkMode, onToggleDark, backendOnline, isRushHour }) => {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="url(#brandGrad)" strokeWidth="2"/>
              <path d="M10 16 L14 20 L22 12" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#52c4ff"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="brand-name">Silent Queue</h1>
            <span className="brand-tagline">AI Queue Intelligence</span>
          </div>
        </div>

        {/* Status & Controls */}
        <div className="header-right">
          {isRushHour && (
            <div className="rush-badge">
              <span className="rush-dot" />
              Rush Hour Approaching
            </div>
          )}

          <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {backendOnline ? 'Backend Online' : 'Demo Mode'}
          </div>

          <button
            className="theme-toggle"
            onClick={onToggleDark}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
