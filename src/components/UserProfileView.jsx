import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, ShieldCheck, ShieldAlert,
  LogOut, QrCode, ExternalLink, Edit3, Plus, Sparkles,
  ArrowLeft, Check, Copy, Calendar, Syringe, Heart,
  AlertTriangle, Key, CheckCircle2, Lock, CheckCircle
} from 'lucide-react';
import { isUserAdmin } from '../firebase/authService';
import { calculateAgeFromBirthDate } from '../utils/ageCalculator';

export default function UserProfileView({
  currentUser,
  pets,
  onSelectPet,
  onOpenQr,
  onEditPet,
  onAddNewPet,
  onOpenAuth,
  onLogout,
  onNavigate,
  onToggleStatus
}) {
  const isAdmin = isUserAdmin(currentUser);
  const [copiedUid, setCopiedUid] = useState(false);

  // Filter pets belonging to this user
  const userPets = pets.filter((pet) => {
    if (!currentUser) return false;
    const matchUid = pet.ownerId && pet.ownerId === currentUser.uid;
    const matchEmail = (
      (pet.ownerEmail && currentUser.email && pet.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (pet.owner?.email && currentUser.email && pet.owner.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    return Boolean(matchUid || matchEmail);
  });

  const safePetsCount = userPets.filter((p) => p.status === 'safe').length;
  const lostPetsCount = userPets.filter((p) => p.status === 'lost').length;

  const handleCopyUid = () => {
    if (!currentUser?.uid) return;
    navigator.clipboard.writeText(currentUser.uid).then(() => {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2200);
    });
  };

  return (
    <div className="user-profile-page view-enter-animation" style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '24px 16px 100px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="profile-circle-btn"
            style={{ width: '42px', height: '42px' }}
            title="Volver a Mascotas Registradas"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917', margin: 0, letterSpacing: '-0.02em' }}>
              Mi Perfil & Mascotas
            </h1>
            <p style={{ fontSize: '13px', color: '#78716C', margin: '3px 0 0' }}>
              Gestiona tu información de cuenta y las placas QR inteligentes
            </p>
          </div>
        </div>

        {currentUser && (
          <button
            onClick={onLogout}
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              borderRadius: '9999px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)'
            }}
          >
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>

      {/* Guest Mode Card if not logged in */}
      {!currentUser ? (
        <div style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)',
          border: '1.5px solid #FDE68A',
          borderRadius: '28px',
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: '32px',
          boxShadow: '0 12px 36px rgba(245, 158, 11, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #FFA800 0%, #EA580C 50%, #FFA800 100%)'
          }} />

          <div className="user-profile-empty-icon-wrap">
            <User size={36} color="#D97706" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917', marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Inicia Sesión en tu Cuenta Q-pet
          </h2>
          <p style={{ fontSize: '14.5px', color: '#78716C', maxWidth: '540px', margin: '0 auto 22px', lineHeight: 1.6 }}>
            Accede o regístrate gratis para vincular tus mascotas a tu perfil, activar notificaciones de rescate con ubicación GPS por WhatsApp y gestionar sus carnets de vacunación digital.
          </p>

          {/* Quick Highlight Pills */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '26px'
          }}>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <QrCode size={13} color="#D97706" />
              <span>Placas QR Inteligentes</span>
            </span>

            <span style={{
              background: '#DCFCE7',
              color: '#15803D',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <MapPin size={13} color="#16A34A" />
              <span>Rescate con GPS en Vivo</span>
            </span>

            <span style={{
              background: '#E0F2FE',
              color: '#0369A1',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Syringe size={13} color="#0284C7" />
              <span>Historial de Vacunación</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenAuth}
              className="profile-cta-btn-primary"
              style={{ padding: '14px 32px', fontSize: '15px' }}
            >
              <User size={18} />
              <span>Iniciar Sesión / Registrarme Gratis</span>
              <Sparkles size={16} />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              <span>Explorar Mascotas Registradas</span>
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated User Hero Card */
        <div className="user-profile-hero-card">
          <div className="user-profile-hero-banner" />

          <div className="user-profile-hero-body">
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '18px',
              borderBottom: '1.5px solid #F5EFE6',
              paddingBottom: '22px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* User Avatar */}
                <div className="user-profile-avatar-large">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Avatar'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                      {currentUser.displayName || 'Dueño Responsable'}
                    </h2>

                    {isAdmin ? (
                      <span style={{
                        background: '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid #FDE68A',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={13} />
                        <span>Administrador</span>
                      </span>
                    ) : (
                      <span style={{
                        background: '#ECFDF5',
                        color: '#047857',
                        border: '1px solid #A7F3D0',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={13} />
                        <span>Usuario Verificado</span>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13px', color: '#57534E' }}>
                    <Mail size={14} color="#D97706" />
                    <span>{currentUser.email}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11px', color: '#A8A29E' }}>
                    <span>UID: {currentUser.uid.substring(0, 14)}...</span>
                    <button
                      onClick={handleCopyUid}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#D97706',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: 700
                      }}
                      title="Copiar UID"
                    >
                      {copiedUid ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                      <span>{copiedUid ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#92400E',
                    border: '1.5px solid #F59E0B',
                    borderRadius: '9999px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <ShieldCheck size={16} color="#B45309" />
                  <span>Abrir Panel de Administrador</span>
                </button>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              <div className="user-profile-stat-box">
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Heart size={22} color="#D97706" />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917', lineHeight: 1.1 }}>
                    {userPets.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>
                    Tus Mascotas Registradas
                  </div>
                </div>
              </div>

              <div className="user-profile-stat-box">
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={22} color="#16A34A" />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>
                    {safePetsCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>
                    A Salvo en Casa
                  </div>
                </div>
              </div>

              <div className="user-profile-stat-box">
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: lostPetsCount > 0 ? '#FEE2E2' : '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldAlert size={22} color={lostPetsCount > 0 ? '#DC2626' : '#94A3B8'} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: lostPetsCount > 0 ? '#DC2626' : '#64748B', lineHeight: 1.1 }}>
                    {lostPetsCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600, marginTop: '2px' }}>
                    {lostPetsCount === 1 ? 'Alerta Extraviada' : 'Alertas Activas'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: MASCOTAS REGISTRADAS */}
      <div style={{ marginTop: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: 0, letterSpacing: '-0.01em' }}>
              Mascotas Registradas ({userPets.length})
            </h3>
            <p style={{ fontSize: '13px', color: '#78716C', margin: '3px 0 0' }}>
              Placas inteligentes asociadas directamente a tu cuenta
            </p>
          </div>

          <button
            onClick={onAddNewPet}
            className="profile-cta-btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '13.5px'
            }}
          >
            <Plus size={17} strokeWidth={2.8} />
            <span>Crear Nueva Placa</span>
          </button>
        </div>

        {/* Pet Cards List */}
        {userPets.length === 0 ? (
          <div className="user-profile-empty-card">
            <div className="user-profile-empty-icon-wrap">
              <Heart size={34} color="#D97706" />
            </div>

            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
              Aún no tienes mascotas registradas en tu cuenta
            </h4>

            <p style={{ fontSize: '14px', color: '#78716C', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              Crea tu primera placa QR inteligente para proteger a tu perro o gato con ubicación GPS en vivo, carnet de vacunación y ficha médica digital accesible en cualquier momento.
            </p>

            {/* Feature Pills */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '26px'
            }}>
              <span style={{
                background: '#FEF3C7',
                color: '#92400E',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle size={14} color="#D97706" />
                <span>Medalla QR personalizada</span>
              </span>

              <span style={{
                background: '#DCFCE7',
                color: '#15803D',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle size={14} color="#16A34A" />
                <span>Ubicación GPS por WhatsApp</span>
              </span>

              <span style={{
                background: '#F1F5F9',
                color: '#475569',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle size={14} color="#64748B" />
                <span>Control de vacunas</span>
              </span>
            </div>

            {/* Elevated Primary Button */}
            <button
              onClick={onAddNewPet}
              className="profile-cta-btn-primary"
              style={{
                padding: '14px 34px',
                fontSize: '15px'
              }}
            >
              <Plus size={20} strokeWidth={2.8} />
              <span>Registrar Mi Mascota Ahora</span>
              <Sparkles size={17} />
            </button>
          </div>
        ) : (
          <div className="pets-grid">
            {userPets.map((pet) => {
              const petAge = pet.birthDate ? calculateAgeFromBirthDate(pet.birthDate) : pet.age;

              return (
                <div
                  key={pet.id}
                  className={`pet-card ${pet.status === 'lost' ? 'status-lost-border' : ''} my-pet-card-highlight`}
                >
                  <div className="pet-card-main">
                    <div
                      className="pet-avatar-wrapper"
                      onClick={() => onSelectPet(pet)}
                    >
                      <img
                        src={pet.photo}
                        alt={pet.name}
                        className="pet-avatar-img"
                      />
                      {pet.status === 'lost' && (
                        <div className="pet-alert-badge" title="Mascota en búsqueda">
                          !
                        </div>
                      )}
                    </div>

                    <div className="pet-info-col">
                      <div className="pet-title-row">
                        <h3
                          onClick={() => onSelectPet(pet)}
                          className="pet-name-link"
                        >
                          {pet.name}
                        </h3>

                        <button
                          onClick={() => onToggleStatus(pet.id)}
                          className={`status-toggle-btn ${pet.status === 'lost' ? 'lost' : 'safe'}`}
                          title="Alternar estado de alerta"
                        >
                          {pet.status === 'lost' ? (
                            <>
                              <ShieldAlert size={12} />
                              <span>¡Extraviado!</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={12} />
                              <span>A Salvo</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="pet-meta-text">
                        {pet.breed} • {petAge || 'Edad no especificada'}
                      </div>

                      {/* Micro info pills */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {Array.isArray(pet.vaccines) && pet.vaccines.length > 0 && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#047857',
                            background: '#ECFDF5',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Syringe size={11} />
                            <span>{pet.vaccines.length} vacuna(s)</span>
                          </span>
                        )}

                        {pet.microchip && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#475569',
                            background: '#F1F5F9',
                            padding: '2px 7px',
                            borderRadius: '6px'
                          }}>
                            Chip: {pet.microchip}
                          </span>
                        )}
                      </div>

                      <div className="pet-location-text" style={{ marginTop: '4px' }}>
                        <MapPin size={13} color="#FFA800" />
                        <span className="location-truncate">
                          {pet.owner?.address || 'Caracas, Venezuela'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pet-card-actions">
                    <button
                      onClick={() => onOpenQr(pet)}
                      className="action-btn qr-btn"
                      title="Ver medalla para collar"
                    >
                      <QrCode size={15} />
                      <span className="btn-label">Placa QR</span>
                    </button>

                    <button
                      onClick={() => onSelectPet(pet)}
                      className="action-btn profile-btn"
                      title="Ver perfil completo"
                    >
                      <ExternalLink size={15} />
                      <span className="btn-label">Ver Ficha</span>
                    </button>

                    <button
                      onClick={() => onEditPet(pet)}
                      className="action-btn edit-btn"
                      title="Editar datos de la mascota"
                    >
                      <Edit3 size={15} />
                      <span className="btn-label">Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
