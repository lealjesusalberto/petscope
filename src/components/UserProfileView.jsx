import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, ShieldCheck, ShieldAlert,
  LogOut, QrCode, ExternalLink, Edit3, Plus, Sparkles,
  ArrowLeft, Check, Copy, Calendar, Syringe, Heart,
  AlertTriangle, Key, CheckCircle2, Lock
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
      padding: '20px 16px 90px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
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
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
              Mi Perfil & Mascotas
            </h1>
            <p style={{ fontSize: '13px', color: '#78716C', margin: '3px 0 0' }}>
              Gestiona tu información personal y las placas QR de tus mascotas
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
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
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
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1.5px solid #FDE68A',
          borderRadius: '24px',
          padding: '32px 24px',
          textAlign: 'center',
          marginBottom: '28px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.1)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid #FFA800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)'
          }}>
            <User size={34} color="#D97706" />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
            Inicia Sesión en tu Cuenta Q-pet
          </h2>
          <p style={{ fontSize: '14px', color: '#78716C', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Inicia sesión o crea tu cuenta gratuita para vincular tus mascotas a tu perfil, recibir avisos de rescate con ubicación GPS y gestionar sus carnets de vacunación.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenAuth}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '14px' }}
            >
              <User size={16} />
              <span>Iniciar Sesión / Registrarme</span>
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
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #F0ECE1',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '18px',
            borderBottom: '1.5px solid #F5EFE6',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* User Avatar */}
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #FFA800 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(245, 124, 0, 0.28)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
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
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                    {currentUser.displayName || 'Dueño Responsable'}
                  </h2>

                  {isAdmin ? (
                    <span style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FDE68A',
                      padding: '3px 10px',
                      borderRadius: '8px',
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
                      borderRadius: '8px',
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
                      gap: '2px'
                    }}
                    title="Copiar UID"
                  >
                    {copiedUid ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
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
                  borderRadius: '14px',
                  padding: '10px 18px',
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
            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={20} color="#D97706" />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917' }}>
                  {userPets.length}
                </div>
                <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
                  Tus Mascotas Registradas
                </div>
              </div>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="#16A34A" />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D' }}>
                  {safePetsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
                  A Salvo en Casa
                </div>
              </div>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: lostPetsCount > 0 ? '#FEE2E2' : '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={20} color={lostPetsCount > 0 ? '#DC2626' : '#94A3B8'} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: lostPetsCount > 0 ? '#DC2626' : '#64748B' }}>
                  {lostPetsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 600 }}>
                  {lostPetsCount === 1 ? 'Alerta Extraviada' : 'Alertas Activas'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TUS MASCOTAS */}
      <div style={{ marginTop: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
              Mis Mascotas ({userPets.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#78716C', margin: '2px 0 0' }}>
              Placas inteligentes asociadas directamente a tu cuenta
            </p>
          </div>

          <button
            onClick={onAddNewPet}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Crear Nueva Placa</span>
          </button>
        </div>

        {/* Pet Cards List */}
        {userPets.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            border: '2px dashed #E2E8F0',
            borderRadius: '20px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#FFF4DC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Heart size={26} color="#FFA800" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', marginBottom: '6px' }}>
              Aún no tienes mascotas registradas en tu cuenta
            </h4>
            <p style={{ fontSize: '13px', color: '#78716C', maxWidth: '420px', margin: '0 auto 16px' }}>
              Crea tu primera placa QR inteligente para proteger a tu peludo con ubicación GPS en vivo y carnet médico digital.
            </p>
            <button
              onClick={onAddNewPet}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '13px' }}
            >
              <Plus size={16} />
              <span>Registrar Mi Mascota Ahora</span>
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
