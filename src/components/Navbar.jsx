import React, { useState } from 'react';
import { QrCode, Plus, Sparkles, Home, User, LogOut, CheckCircle, ShieldCheck, Copy } from 'lucide-react';
import { isUserAdmin } from '../firebase/authService';

export default function Navbar({
  currentView,
  onNavigate,
  onOpenScanner,
  onAddNewPet,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAdmin = isUserAdmin(currentUser);

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

          {isAdmin && (
            <button
              className={`nav-link-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => onNavigate('admin')}
              style={{
                color: currentView === 'admin' ? '#B45309' : '#D97706',
                fontWeight: 800,
                background: currentView === 'admin' ? '#FEF3C7' : 'transparent',
                borderRadius: '12px'
              }}
            >
              <ShieldCheck size={16} />
              <span>Panel Admin</span>
            </button>
          )}

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

          {/* User Auth Profile Button */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={currentUser.displayName || currentUser.email}
                style={{
                  border: '1.5px solid #FFA800',
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontWeight: 800, color: '#D97706', fontSize: '13px' }}>
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  background: '#FFFFFF',
                  border: '1.5px solid #F3E8D6',
                  borderRadius: '16px',
                  padding: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 60,
                  animation: 'fadeIn 0.15s ease'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917', marginBottom: '2px' }}>
                    {currentUser.displayName || 'Usuario Q-pet'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78716C', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#059669',
                    fontWeight: 700,
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #F5EFE6'
                  }}>
                    <CheckCircle size={13} />
                    <span>Conectado a Firebase</span>
                  </div>

                  {/* User UID badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FBF9F5',
                    border: '1px solid #EFEAE1',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '10px', color: '#78716C', fontFamily: 'monospace', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      UID: {currentUser.uid}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(currentUser.uid);
                        alert('¡UID copiado al portapapeles!');
                      }}
                      title="Copiar mi UID de Firebase"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px',
                        cursor: 'pointer',
                        color: '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      <Copy size={11} />
                      <span>Copiar</span>
                    </button>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('admin');
                      }}
                      style={{
                        width: '100%',
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FDE68A',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      <ShieldCheck size={14} color="#D97706" />
                      <span>Panel Administrador</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="icon-btn"
              onClick={onOpenAuth}
              title="Iniciar Sesión / Cuenta"
              style={{ background: '#FFFDF9' }}
            >
              <User size={18} color="#78716C" />
            </button>
          )}

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
