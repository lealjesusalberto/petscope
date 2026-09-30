import React from 'react';
import { ArrowRight, QrCode, ShieldCheck, HeartHandshake, MapPin, Sparkles, Smartphone, CheckCircle } from 'lucide-react';

export default function OnboardingView({ onGetStarted, onExploreDemo }) {
  return (
    <div className="onboarding-page">
      <div className="onboarding-grid">
        {/* Left Column (Desktop) / Bottom Content (Mobile) */}
        <div className="onboarding-content">
          {/* Top Tagline */}
          <div className="hero-pill-badge">
            <Sparkles size={14} color="#D97706" />
            <span>Identificación Inteligente para Perros y Gatos</span>
          </div>

          {/* Curled Doodle Arrow pointing to title */}
          <div className="doodle-arrow">
            <svg width="42" height="34" viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 5,5 Q 35,0 28,20 Q 22,34 38,30" />
              <path d="M 32,24 L 39,30 L 32,36" />
            </svg>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            Protege a tu mascota en cada aventura.
          </h1>

          {/* Description Subtitle */}
          <p className="hero-subtitle">
            Genera una placa QR inteligente para tu peludo. Si llega a extraviarse, cualquier persona que lo encuentre podrá escanear su medalla con la cámara de su teléfono, ver sus datos médicos y enviarte su <strong>ubicación GPS exacta</strong> por WhatsApp con un solo toque.
          </p>

          {/* Feature Pills */}
          <div className="hero-features-grid">
            <div className="hero-feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#FFF4DC', color: '#FFA800' }}>
                <QrCode size={20} />
              </div>
              <div className="feature-info">
                <strong>Placa QR Única</strong>
                <span>Física o descargable</span>
              </div>
            </div>

            <div className="hero-feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                <HeartHandshake size={20} />
              </div>
              <div className="feature-info">
                <strong>WhatsApp 1-Tap</strong>
                <span>Contacto directo</span>
              </div>
            </div>

            <div className="hero-feature-card">
              <div className="feature-icon-wrapper" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <MapPin size={20} />
              </div>
              <div className="feature-info">
                <strong>Alerta GPS</strong>
                <span>Coordenadas exactas</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons Row */}
          <div className="hero-actions-group">
            <button
              id="btn-get-started"
              className="btn-pill-action hero-cta-btn"
              onClick={onGetStarted}
            >
              <div className="btn-pill-icon-circle">
                <ArrowRight size={22} strokeWidth={2.5} />
              </div>
              <span className="btn-pill-text">Crear Placa QR Ahora</span>
            </button>

            <button
              id="btn-explore-demo"
              className="btn-secondary hero-secondary-btn"
              onClick={onExploreDemo}
            >
              <span>Ver Mascotas de Ejemplo</span>
            </button>
          </div>

          {/* Desktop Trust Indicators */}
          <div className="hero-trust-row">
            <div className="trust-item">
              <CheckCircle size={15} color="#16A34A" />
              <span>Sin necesidad de descargar apps</span>
            </div>
            <div className="trust-item">
              <CheckCircle size={15} color="#16A34A" />
              <span>Funciona en iOS y Android</span>
            </div>
            <div className="trust-item">
              <CheckCircle size={15} color="#16A34A" />
              <span>Imprimible en alta resolución</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual with Puppy and Floating Badges */}
        <div className="onboarding-visual">
          <div className="hero-visual-card">
            {/* Top Amber curved background */}
            <div className="visual-top-amber">
              <div className="decorative-bubble bubble-1" />
              <div className="decorative-bubble bubble-2" />
              <div className="decorative-bubble bubble-3" />

              {/* Ambient Glow Halo behind puppy */}
              <div className="hero-glow-halo" />

              {/* Floating Live Badge Top Left */}
              <div className="hero-floating-pill pill-top-left">
                <span className="live-dot-pulse" />
                <MapPin size={13} color="#DC2626" />
                <span>GPS en Tiempo Real</span>
              </div>

              {/* Floating Medical & Vac Badge Right */}
              <div className="hero-floating-pill pill-bottom-right">
                <ShieldCheck size={14} color="#059669" />
                <span>Vacunas & Microchip</span>
              </div>

              <div className="hero-puppy-wrapper">
                <img
                  src="/assets/puppy-hero.jpg"
                  alt="Cachorro feliz con placa inteligente"
                  className="hero-puppy-img"
                />

                {/* Mini collar tag badge */}
                <div className="hero-collar-tag-badge" title="Medalla QR Inteligente">
                  <QrCode size={16} color="#B45309" />
                  <span>Placa Activa</span>
                </div>
              </div>

              {/* Wave SVG divider */}
              <div className="visual-wave-container">
                <svg viewBox="0 0 500 90" preserveAspectRatio="none" className="visual-wave-svg">
                  <path
                    d="M0,45 C150,90 350,10 500,55 L500,90 L0,90 Z"
                    fill="#FFF8EC"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom preview cards */}
            <div className="visual-card-bottom">
              <div className="floating-info-card card-gps">
                <div className="float-icon-pin">
                  <MapPin size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div className="float-title">Alerta de Ubicación</div>
                  <div className="float-sub">Coordenadas enviadas a WhatsApp</div>
                </div>
              </div>

              <div className="floating-info-card card-qr">
                <div className="float-icon-qr">
                  <QrCode size={18} color="#FFA800" />
                </div>
                <div>
                  <div className="float-title">Medalla Inteligente</div>
                  <div className="float-sub">Escaneable con cualquier cámara</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
