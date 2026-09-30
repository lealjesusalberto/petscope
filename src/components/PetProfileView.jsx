import React, { useState } from 'react';
import {
  MapPin, Phone, MessageCircle, Navigation, ShieldCheck,
  AlertTriangle, Heart, Award, ArrowLeft, QrCode, Share2, Check,
  Calendar, Syringe, Clock, CheckCircle2, Sparkles, Edit3
} from 'lucide-react';
import { calculateAgeFromBirthDate, formatBirthDateDisplay } from '../utils/ageCalculator';

export default function PetProfileView({ pet, onBack, onOpenQr, onEditPet }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!pet) return null;

  const displayAge = pet.birthDate ? calculateAgeFromBirthDate(pet.birthDate) : pet.age;

  // Clean phone number ensuring Venezuelan +58 international prefix for WhatsApp
  const getCleanWhatsAppNumber = (rawPhone) => {
    if (!rawPhone) return '';
    let digits = rawPhone.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
      digits = '58' + digits.substring(1);
    } else if (!digits.startsWith('58')) {
      digits = '58' + digits;
    }
    return digits;
  };

  // Generate WhatsApp message with GPS or initial text
  const getWhatsAppUrl = (customMsg = null) => {
    const cleanPhone = getCleanWhatsAppNumber(pet.owner?.phone);
    const defaultText = `¡Hola ${pet.owner?.name || ''}! Acabo de escanear la placa QR de tu mascota *${pet.name}*. Por favor contáctame para coordinar su entrega segura.`;
    const message = encodeURIComponent(customMsg || defaultText);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Request browser geolocation and send to WhatsApp
  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no está disponible en este dispositivo.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const accuracy = Math.round(position.coords.accuracy);
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

        const locationMsg = `¡Hola ${pet.owner?.name || ''}! Encontré a tu mascota *${pet.name}*. Mi ubicación GPS actual es:\n📍 ${mapsLink} (Precisión: ±${accuracy}m)\nPor favor avísame cuando veas este mensaje.`;

        setGpsLoading(false);
        setGpsSuccess(true);

        window.open(getWhatsAppUrl(locationMsg), '_blank');
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('No se pudo obtener la ubicación. Por favor autoriza el permiso de GPS en tu navegador.');
        console.error('Geo error:', err);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?id=${pet.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="pet-profile-page view-enter-animation">
      {/* Top Floating Action Bar */}
      <div className="profile-top-bar">
        <button
          onClick={onBack}
          className="profile-circle-btn"
          aria-label="Volver al panel"
        >
          <ArrowLeft size={20} />
          <span className="back-btn-text">Volver</span>
        </button>

        <div className="profile-actions-right">
          {onEditPet && (
            <button
              onClick={() => onEditPet(pet)}
              className="profile-circle-btn"
              title="Editar datos de esta mascota"
              style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
            >
              <Edit3 size={18} color="#D97706" />
            </button>
          )}

          <button
            onClick={handleCopyProfileLink}
            className="profile-circle-btn"
            title="Copiar enlace de esta ficha"
          >
            {copiedLink ? <Check size={18} color="#16A34A" /> : <Share2 size={18} />}
          </button>

          <button
            onClick={() => onOpenQr(pet)}
            className="profile-circle-btn qr-active-btn"
            title="Ver Placa QR para Collar"
          >
            <QrCode size={20} />
          </button>
        </div>
      </div>

      {/* Responsive Profile Container (2 columns on desktop, stacked on mobile) */}
      <div className="profile-container">
        {/* Left Column (Desktop) / Top Media (Mobile) */}
        <div className="profile-media-col">
          <div className="profile-hero-image-wrapper">
            <img
              src={pet.photo}
              alt={pet.name}
              className="profile-hero-img"
            />
            {pet.status === 'lost' ? (
              <div className="hero-status-pill lost">
                <AlertTriangle size={14} />
                <span>¡Mascota Extraviada!</span>
              </div>
            ) : (
              <div className="hero-status-pill safe">
                <ShieldCheck size={14} />
                <span>Identificación Activa</span>
              </div>
            )}
          </div>

          {/* Desktop QR Tag Fast Card */}
          <div className="desktop-qr-card">
            <div className="desktop-qr-header">
              <QrCode size={18} color="#FFA800" />
              <span>Placa Oficial de {pet.name}</span>
            </div>
            <p className="desktop-qr-desc">
              Esta placa está vinculada a esta ficha de identificación.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onOpenQr(pet)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px', flex: 1 }}
              >
                <span>Ver Medalla QR</span>
              </button>

              {onEditPet && (
                <button
                  onClick={() => onEditPet(pet)}
                  className="btn-primary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#D97706',
                    borderColor: '#B45309'
                  }}
                >
                  <Edit3 size={14} />
                  <span>Editar Ficha</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Desktop) / Overlapping Content Sheet (Mobile) */}
        <div className="profile-content-sheet">
          {/* Header: Name, Breed, Location */}
          <div className="profile-header-info">
            <div className="profile-title-row">
              <h1 className="profile-pet-name">
                {pet.name}
              </h1>

              <div className="profile-badge-desktop">
                {pet.status === 'lost' ? (
                  <span className="status-badge lost">
                    <AlertTriangle size={14} />
                    <span>Extraviado</span>
                  </span>
                ) : (
                  <span className="status-badge safe">
                    <ShieldCheck size={14} />
                    <span>A Salvo</span>
                  </span>
                )}
              </div>
            </div>

            <p className="profile-pet-breed">
              <span>{pet.breed}</span>
              <span>•</span>
              <span>{pet.species === 'dog' ? 'Perro' : 'Gato'}</span>
            </p>

            <div className="profile-location-tag">
              <MapPin size={16} color="#FFA800" />
              <span>{pet.owner?.address || 'Caracas, Venezuela'}</span>
            </div>
          </div>

          {/* Recompensa Banner if available */}
          {pet.reward && (
            <div className="reward-banner">
              <Award size={22} color="#D97706" />
              <div>
                <div className="reward-sub">Recompensa Ofrecida</div>
                <div className="reward-title">{pet.reward}</div>
              </div>
            </div>
          )}

          {/* 3 Metric Pills: Edad con Fecha Nacimiento, Sexo, Vacunas */}
          <div className="metric-pills-row">
            <div className="metric-pill-card age-metric-pill-card">
              <span className="metric-pill-label">Edad</span>
              <span className="metric-pill-value">{displayAge || 'No indicada'}</span>
              {pet.birthDate && (
                <div className="birthdate-profile-tag" title="Fecha de nacimiento">
                  <Calendar size={11} color="#D97706" />
                  <span>{formatBirthDateDisplay(pet.birthDate)}</span>
                </div>
              )}
            </div>

            <div className="metric-pill-card">
              <span className="metric-pill-label">Sexo</span>
              <span className="metric-pill-value">{pet.gender}</span>
            </div>

            <div className="metric-pill-card">
              <span className="metric-pill-label">Vacunación</span>
              <span className="metric-pill-value" style={{ color: '#059669', fontSize: '13px' }}>
                {Array.isArray(pet.vaccines) && pet.vaccines.length > 0
                  ? `${pet.vaccines.length} al día`
                  : (pet.vaccinated.includes('Sí') ? 'Al día' : pet.vaccinated)}
              </span>
            </div>
          </div>

          {/* Emergency Actions Section (Rescuer Contact Box) */}
          <div className="emergency-contact-box">
            <div className="emergency-header">
              <span className="emergency-title">
                Contacto del Rescate
              </span>
              <span className="emergency-owner-name">
                Dueño: <strong>{pet.owner?.name}</strong>
              </span>
            </div>

            {/* Rescuer Actions */}
            <div className="emergency-buttons-col">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                id="btn-whatsapp-contact"
              >
                <MessageCircle size={20} />
                <span>Contactar por WhatsApp</span>
              </a>

              <a
                href={`tel:+${getCleanWhatsAppNumber(pet.owner?.phone)}`}
                className="btn-call"
                id="btn-phone-call"
              >
                <Phone size={18} />
                <span>Llamar a {pet.owner?.name?.split(' ')[0]} ({pet.owner?.phoneFormatted || pet.owner?.phone})</span>
              </a>

              <button
                onClick={handleSendLocation}
                className="btn-gps"
                id="btn-send-gps"
                disabled={gpsLoading}
              >
                <Navigation size={18} />
                <span>
                  {gpsLoading ? 'Obteniendo GPS...' : gpsSuccess ? '¡Ubicación enviada por WhatsApp!' : 'Enviar mi ubicación GPS al dueño'}
                </span>
              </button>
            </div>

            {gpsError && (
              <p className="gps-error-msg">
                {gpsError}
              </p>
            )}
          </div>

          {/* About Section */}
          <div className="profile-section">
            <h3 className="section-title">
              Sobre {pet.name}
            </h3>
            <p className="section-body">
              {pet.about || 'Mascota muy cariñosa y dócil. Por favor comunícate con su familia si está perdida.'}
            </p>
          </div>

          {/* Historial de Vacunación & Médico (Carnet Digital) */}
          <div className="vaccine-history-profile-card">
            <div className="vaccine-history-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="vaccine-icon-badge">
                  <Syringe size={18} color="#059669" />
                </div>
                <div>
                  <h4 className="vaccine-profile-title">
                    Historial de Vacunación & Salud
                  </h4>
                  <p className="vaccine-profile-subtitle">
                    Carnet médico con fechas de dosis y próximos refuerzos
                  </p>
                </div>
              </div>

              {Array.isArray(pet.vaccines) && pet.vaccines.length > 0 && (
                <span className="vaccine-count-badge">
                  {pet.vaccines.length} {pet.vaccines.length === 1 ? 'vacuna' : 'vacunas'}
                </span>
              )}
            </div>

            {Array.isArray(pet.vaccines) && pet.vaccines.length > 0 ? (
              <div className="profile-vaccine-list">
                {pet.vaccines.map((vac) => (
                  <div key={vac.id || vac.name} className="profile-vaccine-item">
                    <div className="p-vac-top">
                      <div className="p-vac-name-row">
                        <CheckCircle2 size={15} color="#059669" className="p-vac-check" />
                        <span className="p-vac-name">{vac.name}</span>
                      </div>
                      <span className="p-vac-status-pill">
                        Aplicada ✓
                      </span>
                    </div>

                    <div className="p-vac-details-row">
                      <div className="p-vac-date">
                        <Calendar size={12} color="#78716C" />
                        <span>Fecha: <strong>{vac.date}</strong></span>
                      </div>

                      {vac.nextDue && (
                        <div className="p-vac-next-date">
                          <Clock size={12} color="#D97706" />
                          <span>Próximo Refuerzo: <strong>{vac.nextDue}</strong></span>
                        </div>
                      )}
                    </div>

                    {vac.vet && (
                      <div className="p-vac-vet-line">
                        <span>🏥 Veterinario: {vac.vet}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-vaccine-empty">
                <Syringe size={22} color="#9CA3AF" />
                <p>No hay vacunas detalladas registradas en esta ficha.</p>
                <span>Estado general reportado: <strong>{pet.vaccinated || 'Al día'}</strong></span>
              </div>
            )}
          </div>

          {/* Medical & Special Care */}
          <div className="medical-care-card">
            <h4 className="medical-title">
              <Heart size={16} color="#D97706" />
              <span>Cuidados Médicos & Alergias</span>
            </h4>
            <p className="medical-body">
              {pet.medicalNotes || 'Sin condiciones médicas especiales registradas.'}
            </p>
            {pet.microchip && (
              <div className="microchip-row">
                <span>Microchip ID:</span>
                <span className="microchip-code">{pet.microchip}</span>
              </div>
            )}
          </div>

          {/* Backup Contact */}
          {pet.owner?.altPhone && (
            <div className="backup-contact-row">
              Teléfono alternativo de respaldo: <a href={`tel:${pet.owner.altPhone}`}>{pet.owner.altPhone}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
