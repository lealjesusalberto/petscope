import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle, getAuthErrorMessage } from '../firebase/authService';
import confetti from 'canvas-confetti';

export default function AuthModal({ onClose, onSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (isRegister) {
        if (!name.trim()) {
          setError('Por favor ingresa tu nombre.');
          setLoading(false);
          return;
        }
        userCredential = await registerWithEmail(email, password, name.trim());
      } else {
        userCredential = await loginWithEmail(email, password);
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      if (onSuccess) onSuccess(userCredential.user);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await loginWithGoogle();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      if (onSuccess) onSuccess(userCredential.user);
      onClose();
    } catch (err) {
      console.error('Google Auth error:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content form-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        {/* Header */}
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">
              {isRegister ? 'Crear Cuenta en Q-pet' : 'Iniciar Sesión en Q-pet'}
            </h3>
            <p className="modal-sub">
              Sincroniza y administra tus placas QR en la nube
            </p>
          </div>

          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switchers */}
        <div style={{
          display: 'flex',
          background: '#F5EFE6',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: !isRegister ? '#FFFFFF' : 'transparent',
              color: !isRegister ? '#1C1917' : '#78716C',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: !isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: isRegister ? '#FFFFFF' : 'transparent',
              color: isRegister ? '#1C1917' : '#78716C',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="modal-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#FFFFFF',
            border: '1.5px solid #E7E5E4',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#1C1917',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '18px',
            transition: 'all 0.2s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '16px 0',
          color: '#A8A29E',
          fontSize: '12px',
          fontWeight: 600
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
          <span>O con tu correo</span>
          <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nombre y Apellido</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Valentina Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-pill-action"
            disabled={loading}
            style={{ width: '100%' }}
          >
            <div className="btn-pill-icon-circle">
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            </div>
            <span className="btn-pill-text">
              {loading
                ? 'Conectando...'
                : isRegister
                ? 'Crear Cuenta'
                : 'Iniciar Sesión'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
