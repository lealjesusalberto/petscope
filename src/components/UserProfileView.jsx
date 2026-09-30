import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, ShieldCheck, ShieldAlert,
  LogOut, QrCode, ExternalLink, Edit3, Plus, Sparkles,
  ArrowLeft, Check, Copy, Syringe, Heart,
  Camera, CheckCircle2, Save, X, Loader2, Sparkle
} from 'lucide-react';
import { isUserAdmin, updateUserProfile, fetchUserFirestoreData } from '../firebase/authService';
import { calculateAgeFromBirthDate } from '../utils/ageCalculator';
import { compressImageFile } from '../utils/imageCompressor';

export default function UserProfileView({
  currentUser,
  authLoading = false,
  pets,
  onSelectPet,
  onOpenQr,
  onEditPet,
  onAddNewPet,
  onOpenAuth,
  onLogout,
  onNavigate,
  onToggleStatus,
  onUserUpdated,
  showToast
}) {
  const isAdmin = isUserAdmin(currentUser);
  const [copiedUid, setCopiedUid] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('profile'); // 'profile' | 'pets'
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form state
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    photoURL: currentUser?.photoURL || ''
  });

  // Sync state and fetch extra user document from Firestore only if phone/address not in cache
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        photoURL: currentUser.photoURL || ''
      });

      if (currentUser?.uid && (!currentUser.phone || !currentUser.address)) {
        fetchUserFirestoreData(currentUser.uid).then((data) => {
          if (data) {
            setFormData((prev) => ({
              ...prev,
              displayName: data.displayName || prev.displayName,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              photoURL: data.photoURL || prev.photoURL
            }));
          }
        }).catch(() => {});
      }
    }
  }, [currentUser]);

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
      setTimeout(() => setCopiedUid(false), 2000);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressedDataUrl = await compressImageFile(file, 400, 0.85);
      setFormData((prev) => ({ ...prev, photoURL: compressedDataUrl }));
      setIsEditing(true);
      if (showToast) {
        showToast('Foto cargada. Haz clic en "Guardar Cambios" para confirmarla.');
      }
    } catch (err) {
      console.error('Error optimizando foto de perfil:', err);
      alert('No se pudo procesar la foto seleccionada.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        phone: formData.phone,
        address: formData.address
      });

      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      } else if (showToast) {
        showToast('¡Perfil actualizado con éxito!');
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error guardando perfil:', err);
      alert('Error al guardar el perfil: ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      photoURL: currentUser?.photoURL || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-fit-container view-enter-animation">
      {/* Hidden file input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="profile-circle-btn"
            style={{ width: '38px', height: '38px', padding: 0, justifyContent: 'center' }}
            title="Volver a Mascotas Registradas"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: 0, letterSpacing: '-0.02em' }}>
              Mi Perfil & Mascotas
            </h1>
            <p style={{ fontSize: '12px', color: '#78716C', margin: '1px 0 0' }}>
              Gestiona tu información de dueño y tus placas inteligentes
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
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>

      {/* If still checking auth session on fresh reload, show sleek skeleton instead of flashing guest card */}
      {authLoading ? (
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #F0ECE1',
          borderRadius: '24px',
          padding: '42px 24px',
          textAlign: 'center',
          maxWidth: '460px',
          margin: '28px auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}>
          <div className="user-profile-empty-icon-wrap" style={{ width: '56px', height: '56px', margin: '0 auto 12px' }}>
            <Loader2 size={26} color="#D97706" className="animate-spin" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>
            Verificando sesión segura...
          </h3>
          <p style={{ fontSize: '13px', color: '#78716C', margin: 0 }}>
            Conectando con tu cuenta Q-pet
          </p>
        </div>
      ) : !currentUser ? (
        /* Guest Mode View */
        <div style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)',
          border: '1.5px solid #FDE68A',
          borderRadius: '24px',
          padding: '32px 20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.08)',
          maxWidth: '560px',
          margin: '20px auto'
        }}>
          <div className="user-profile-empty-icon-wrap" style={{ width: '60px', height: '60px', margin: '0 auto 14px' }}>
            <User size={30} color="#D97706" />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
            Inicia Sesión en tu Cuenta Q-pet
          </h2>
          <p style={{ fontSize: '13.5px', color: '#78716C', lineHeight: 1.5, margin: '0 auto 20px', maxWidth: '440px' }}>
            Inicia sesión o regístrate gratis para vincular tus mascotas a tu perfil, personalizar tu foto de dueño y recibir avisos de rescate con ubicación GPS.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenAuth}
              className="profile-cta-btn-primary"
              style={{ padding: '11px 24px', fontSize: '13.5px' }}
            >
              <User size={16} />
              <span>Iniciar Sesión / Registrarme</span>
              <Sparkles size={15} />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-secondary"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <span>Explorar Mascotas</span>
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Fit-Height Bento Grid */
        <div>
          {/* Mobile Tabs Switcher */}
          <div className="profile-mobile-tabs">
            <button
              className={`profile-mobile-tab-btn ${activeMobileTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('profile')}
            >
              <User size={15} />
              <span>Mi Perfil</span>
            </button>

            <button
              className={`profile-mobile-tab-btn ${activeMobileTab === 'pets' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('pets')}
            >
              <Heart size={15} />
              <span>Mascotas Registradas ({userPets.length})</span>
            </button>
          </div>

          <div className="profile-fit-grid">
            {/* COLUMN 1: User Profile Card & Information */}
            <div
              className="profile-user-card"
              style={{
                display: activeMobileTab === 'profile' ? 'block' : undefined
              }}
            >
              {/* Avatar Section with Interactive Upload Badge */}
              <div className="profile-avatar-wrapper">
                <div
                  className="profile-avatar-circle"
                  onClick={() => fileInputRef.current?.click()}
                  title="Haz clic para cambiar tu foto de perfil"
                >
                  {isCompressingPhoto ? (
                    <Loader2 size={26} color="#FFFFFF" className="animate-spin" />
                  ) : formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (formData.displayName || currentUser.email || 'U')[0].toUpperCase()
                  )}
                </div>

                <button
                  type="button"
                  className="profile-avatar-camera-badge"
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  aria-label="Subir foto de perfil"
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* User Identity / View Mode */}
              {!isEditing ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                      {formData.displayName || currentUser.displayName || 'Dueño Responsable'}
                    </h2>
                    {isAdmin ? (
                      <span style={{
                        background: '#FEF3C7',
                        color: '#B45309',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <ShieldCheck size={12} />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span style={{
                        background: '#ECFDF5',
                        color: '#047857',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CheckCircle2 size={12} />
                        <span>Verificado</span>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#78716C', marginTop: '4px' }}>
                    <Mail size={13} color="#D97706" />
                    <span>{currentUser.email}</span>
                  </div>

                  {/* Contact Info Pills */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    margin: '14px 0',
                    textAlign: 'left',
                    background: '#FAFAF9',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    border: '1px solid #F0ECE1'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#57534E', fontWeight: 600 }}>
                        <Phone size={13} color="#D97706" />
                        <span>Teléfono:</span>
                      </span>
                      <strong style={{ color: formData.phone ? '#1C1917' : '#A8A29E' }}>
                        {formData.phone || 'No registrado'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#57534E', fontWeight: 600 }}>
                        <MapPin size={13} color="#D97706" />
                        <span>Ciudad:</span>
                      </span>
                      <strong style={{ color: formData.address ? '#1C1917' : '#A8A29E' }}>
                        {formData.address || 'Caracas, VE'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px dashed #E7E5E4', paddingTop: '6px', marginTop: '2px' }}>
                      <span style={{ color: '#A8A29E' }}>UID: {currentUser.uid.substring(0, 10)}...</span>
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
                          fontWeight: 700,
                          fontSize: '11px'
                        }}
                      >
                        {copiedUid ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                        <span>{copiedUid ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      fontSize: '13px',
                      marginBottom: '14px'
                    }}
                  >
                    <Edit3 size={14} color="#D97706" />
                    <span>Editar Información & Foto</span>
                  </button>
                </div>
              ) : (
                /* Edit Profile Form Mode */
                <form onSubmit={handleSaveProfile} style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '13px', color: '#1C1917' }}>Editar Perfil</strong>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        color: '#92400E',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Camera size={12} />
                      <span>Cambiar Foto</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#57534E', marginBottom: '4px' }}>
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className="profile-input-field"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Tu nombre y apellido"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#57534E', marginBottom: '4px' }}>
                        Teléfono de Contacto (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        className="profile-input-field"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+58 412 1234567"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#57534E', marginBottom: '4px' }}>
                        Ciudad / Dirección
                      </label>
                      <input
                        type="text"
                        className="profile-input-field"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Ej. Caracas, El Cafetal"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="profile-cta-btn-primary"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="btn-secondary"
                      style={{ padding: '10px 14px', fontSize: '13px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </form>
              )}

              {/* Compact Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                borderTop: '1.5px solid #F5EFE6',
                paddingTop: '14px',
                marginTop: '10px'
              }}>
                <div style={{
                  background: '#FEF3C7',
                  borderRadius: '12px',
                  padding: '8px 4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#92400E' }}>
                    {userPets.length}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#B45309', fontWeight: 700 }}>
                    Mascotas
                  </div>
                </div>

                <div style={{
                  background: '#DCFCE7',
                  borderRadius: '12px',
                  padding: '8px 4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803D' }}>
                    {safePetsCount}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 700 }}>
                    A Salvo
                  </div>
                </div>

                <div style={{
                  background: lostPetsCount > 0 ? '#FEE2E2' : '#F1F5F9',
                  borderRadius: '12px',
                  padding: '8px 4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: lostPetsCount > 0 ? '#DC2626' : '#64748B' }}>
                    {lostPetsCount}
                  </div>
                  <div style={{ fontSize: '10.5px', color: lostPetsCount > 0 ? '#DC2626' : '#64748B', fontWeight: 700 }}>
                    Alertas
                  </div>
                </div>
              </div>

              {/* Admin Panel button if user is admin */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#92400E',
                    border: '1.5px solid #F59E0B',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={14} color="#B45309" />
                  <span>Panel Administrador</span>
                </button>
              )}
            </div>

            {/* COLUMN 2: Mascotas Registradas (Scrollable & Fit-Height) */}
            <div
              className="profile-pets-box"
              style={{
                display: activeMobileTab === 'pets' ? 'flex' : undefined
              }}
            >
              {/* Header with Title and Create Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px',
                borderBottom: '1.5px solid #F5EFE6',
                paddingBottom: '12px'
              }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1C1917', margin: 0, letterSpacing: '-0.01em' }}>
                    Mascotas Registradas ({userPets.length})
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#78716C' }}>
                    Placas inteligentes vinculadas a tu cuenta
                  </span>
                </div>

                <button
                  onClick={onAddNewPet}
                  className="profile-cta-btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    borderRadius: '9999px'
                  }}
                >
                  <Plus size={15} strokeWidth={2.8} />
                  <span>Crear Placa</span>
                </button>
              </div>

              {/* Content: Empty State or Pet Cards List */}
              <div className="profile-pets-scroll">
                {userPets.length === 0 ? (
                  <div style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF9 100%)',
                    border: '1.5px dashed #FDE68A',
                    borderRadius: '20px',
                    padding: '28px 18px',
                    textAlign: 'center',
                    margin: 'auto 0'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      border: '1.5px solid #FDE68A'
                    }}>
                      <Heart size={24} color="#D97706" />
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: '0 0 6px' }}>
                      Aún no tienes mascotas registradas
                    </h4>

                    <p style={{ fontSize: '12.5px', color: '#78716C', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                      Crea la primera placa QR inteligente para tu perro o gato con ubicación GPS en vivo y carnet médico.
                    </p>

                    <button
                      onClick={onAddNewPet}
                      className="profile-cta-btn-primary"
                      style={{ padding: '10px 22px', fontSize: '13px' }}
                    >
                      <Plus size={16} strokeWidth={2.8} />
                      <span>Registrar Mi Mascota Ahora</span>
                      <Sparkles size={15} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '12px'
                  }}>
                    {userPets.map((pet) => {
                      const petAge = pet.birthDate ? calculateAgeFromBirthDate(pet.birthDate) : pet.age;

                      return (
                        <div
                          key={pet.id}
                          className={`pet-card ${pet.status === 'lost' ? 'status-lost-border' : ''} my-pet-card-highlight`}
                          style={{ padding: '12px', borderRadius: '18px' }}
                        >
                          <div className="pet-card-main" style={{ gap: '10px', marginBottom: '8px' }}>
                            <div
                              className="pet-avatar-wrapper"
                              onClick={() => onSelectPet(pet)}
                              style={{ width: '56px', height: '56px' }}
                            >
                              <img
                                src={pet.photo}
                                alt={pet.name}
                                className="pet-avatar-img"
                              />
                              {pet.status === 'lost' && (
                                <div className="pet-alert-badge" title="Mascota extraviada">!</div>
                              )}
                            </div>

                            <div className="pet-info-col">
                              <div className="pet-title-row">
                                <h3
                                  onClick={() => onSelectPet(pet)}
                                  className="pet-name-link"
                                  style={{ fontSize: '15px' }}
                                >
                                  {pet.name}
                                </h3>

                                <button
                                  onClick={() => onToggleStatus(pet.id)}
                                  className={`status-toggle-btn ${pet.status === 'lost' ? 'lost' : 'safe'}`}
                                  style={{ padding: '2px 8px', fontSize: '10px' }}
                                >
                                  {pet.status === 'lost' ? (
                                    <>
                                      <ShieldAlert size={11} />
                                      <span>Extraviado</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck size={11} />
                                      <span>A Salvo</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="pet-meta-text" style={{ fontSize: '12px' }}>
                                {pet.breed} • {petAge || 'Edad N/E'}
                              </div>

                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '3px' }}>
                                {Array.isArray(pet.vaccines) && pet.vaccines.length > 0 && (
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#047857',
                                    background: '#ECFDF5',
                                    padding: '1px 6px',
                                    borderRadius: '5px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}>
                                    <Syringe size={10} />
                                    <span>{pet.vaccines.length} vacunas</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pet-card-actions" style={{ gap: '6px' }}>
                            <button
                              onClick={() => onOpenQr(pet)}
                              className="action-btn qr-btn"
                              title="Ver Placa QR"
                              style={{ padding: '6px 8px', fontSize: '11px' }}
                            >
                              <QrCode size={13} />
                              <span className="btn-label">Placa</span>
                            </button>

                            <button
                              onClick={() => onSelectPet(pet)}
                              className="action-btn profile-btn"
                              title="Ver Ficha Médica"
                              style={{ padding: '6px 8px', fontSize: '11px' }}
                            >
                              <ExternalLink size={13} />
                              <span className="btn-label">Ficha</span>
                            </button>

                            <button
                              onClick={() => onEditPet(pet)}
                              className="action-btn edit-btn"
                              title="Editar datos de la mascota"
                              style={{ padding: '6px 8px', fontSize: '11px' }}
                            >
                              <Edit3 size={13} />
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
          </div>
        </div>
      )}
    </div>
  );
}
