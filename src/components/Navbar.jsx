import React from 'react';
import { QrCode, Plus, Sparkles, Home } from 'lucide-react';

export default function Navbar({ currentView, onNavigate, onOpenScanner, onAddNewPet }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-badge" onClick={() => onNavigate('onboarding')}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="4" r="2" fill="currentColor"/>
              <circle cx="18" cy="8" r="2" fill="currentColor"/>
              <circle cx="20" cy="16" r="2" fill="currentColor"/>
              <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="brand-text-block">
            <div className="brand-title">
              <span className="brand-letter-q">Q</span>
              <span className="brand-hyphen">-</span>
              <span className="brand-pet">pet</span>
            </div>
            <span className="brand-subtitle-tag">Smart QR ID</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          <button
            className={`nav-link-btn ${currentView === 'onboarding' ? 'active' : ''}`}
            onClick={() => onNavigate('onboarding')}
          >
            Inicio
          </button>

          <button
            className={`nav-link-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Mis Mascotas
          </button>

          <button
            className="nav-link-btn"
            onClick={onOpenScanner}
          >
            <QrCode size={16} />
            <span>Escanear QR</span>
          </button>
        </nav>

        {/* Header Action Buttons */}
        <div className="header-actions">
          {/* Quick Scanner Icon Button */}
          <button
            className="icon-btn header-scanner-btn"
            onClick={onOpenScanner}
            title="Escanear Placa QR"
            aria-label="Escanear Placa QR"
          >
            <QrCode size={18} />
          </button>

          {/* Primary Action Button */}
          <button
            className="header-cta-btn"
            onClick={onAddNewPet}
            title="Crear Nueva Placa QR"
          >
            <Plus size={18} strokeWidth={2.8} />
            <span className="btn-text">Nueva Placa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
