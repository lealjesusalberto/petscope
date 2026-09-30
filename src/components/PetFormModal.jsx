import React, { useState } from 'react';
import {
  X, Upload, Check, AlertCircle, Sparkles, Heart, Phone, ShieldCheck,
  ChevronRight, Dog, Cat, Calendar, Syringe, Plus, Trash2, CheckCircle2, Clock, ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DOG_BREEDS, CAT_BREEDS, DOG_BREEDS_CATALOG, CAT_BREEDS_CATALOG } from '../data/breedsData';
import { INITIAL_PETS } from '../data/petsData';
import BreedPickerModal from './BreedPickerModal';
import { calculateAgeFromBirthDate } from '../utils/ageCalculator';
import { isUserAdmin } from '../firebase/authService';

const PRESET_AVATARS = [
  { label: 'Husky', url: '/assets/husky.jpg' },
  { label: 'Bulldog', url: '/assets/bulldog-ingles.jpg' },
  { label: 'Frenchie', url: '/assets/frenchie.jpg' },
  { label: 'Pastor Alemán', url: '/assets/pastor-aleman.jpg' },
  { label: 'Golden', url: '/assets/puppy-hero.jpg' },
  { label: 'Corgi', url: '/assets/corgi-hero.jpg' },
  { label: 'Siamés', url: '/assets/siamese.jpg' },
  { label: 'Scottish', url: '/assets/cat-hero.jpg' }
];

// High-Definition Canvas Optimizer: keeps 1200px Retina HD resolution with bi-cubic antialiasing
function compressImageFile(file, maxDimension = 1200, quality = 0.88) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain exact aspect ratio up to 1200px HD resolution
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Studio-grade high quality bi-cubic interpolation to eliminate pixelation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for ultra-sharp rendering, fallback to crisp JPEG
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Safety check to ensure it stays below Firestore's 1MB limit
        if (compressedDataUrl.length > 800000) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
        }

        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve('/assets/puppy-hero.jpg');
  });
}


export default function PetFormModal({ initialPet, currentUser, onRequireAuth, onSave, onClose }) {
  const isEditing = Boolean(initialPet?.id);
  const isOwner = currentUser && (
    (initialPet?.ownerId && initialPet.ownerId === currentUser.uid) ||
    (initialPet?.ownerEmail && currentUser.email && initialPet.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
    (initialPet?.owner?.email && currentUser.email && initialPet.owner.email.toLowerCase() === currentUser.email.toLowerCase())
  );
  const canEdit = !isEditing || isOwner || isUserAdmin(currentUser);

  if (isEditing && !canEdit) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '36px 24px', maxWidth: '440px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldAlert size={30} color="#DC2626" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
            Acceso no autorizado
          </h3>
          <p style={{ fontSize: '13.5px', color: '#78716C', lineHeight: 1.5, marginBottom: '22px' }}>
            Esta mascota pertenece a otro usuario registrado. Solo su dueño o un administrador pueden editar sus datos.
          </p>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const [isBreedPickerOpen, setIsBreedPickerOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const defaultPetMatch = INITIAL_PETS.find((p) => p.id === initialPet?.id);
  const initialBirthDate = initialPet?.birthDate || defaultPetMatch?.birthDate || '';
  const initialVaccines = (Array.isArray(initialPet?.vaccines) && initialPet.vaccines.length > 0)
    ? initialPet.vaccines
    : (defaultPetMatch?.vaccines || []);

  const [formData, setFormData] = useState({
    id: initialPet?.id || `pet-${Date.now()}`,
    name: initialPet?.name || '',
    species: initialPet?.species || 'dog',
    breed: initialPet?.breed || '',
    birthDate: initialBirthDate,
    age: initialBirthDate ? calculateAgeFromBirthDate(initialBirthDate) : (initialPet?.age || ''),
    gender: initialPet?.gender || 'Macho',
    vaccinated: initialPet?.vaccinated || 'Sí, al día',
    vaccines: initialVaccines,
    weight: initialPet?.weight || '',
    color: initialPet?.color || '',
    microchip: initialPet?.microchip || '',
    status: initialPet?.status || 'safe',
    photo: initialPet?.photo || '/assets/puppy-hero.jpg',
    about: initialPet?.about || '',
    medicalNotes: initialPet?.medicalNotes || '',
    reward: initialPet?.reward || '',
    ownerId: initialPet?.ownerId || currentUser?.uid || null,
    ownerEmail: initialPet?.ownerEmail || currentUser?.email || '',
    owner: {
      name: initialPet?.owner?.name || currentUser?.displayName || '',
      phone: initialPet?.owner?.phone || '',
      phoneFormatted: initialPet?.owner?.phoneFormatted || '',
      altPhone: initialPet?.owner?.altPhone || '',
      address: initialPet?.owner?.address || '',
      email: initialPet?.owner?.email || currentUser?.email || ''
    }
  });

  const [error, setError] = useState('');

  const currentCatalog = formData.species === 'dog' ? DOG_BREEDS_CATALOG : CAT_BREEDS_CATALOG;
  const popularQuickBreeds = formData.species === 'dog'
    ? ['Siberian Husky', 'Bulldog Inglés', 'Bulldog Francés', 'Pastor Alemán', 'Golden Retriever', 'Welsh Corgi']
    : ['Siamés', 'Scottish Fold', 'Persa', 'Maine Coon', 'Bengalí', 'Mestizo / Común'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('owner.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        owner: { ...prev.owner, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [newVacName, setNewVacName] = useState('');
  const [newVacDate, setNewVacDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVacNextDue, setNewVacNextDue] = useState('');
  const [newVacVet, setNewVacVet] = useState('');

  const handleBirthDateChange = (e) => {
    const bDate = e.target.value;
    const computedAge = calculateAgeFromBirthDate(bDate);
    setFormData(prev => ({
      ...prev,
      birthDate: bDate,
      age: computedAge || ''
    }));
  };

  const handleAddVaccine = (e) => {
    if (e) e.preventDefault();
    if (!newVacName.trim()) return;
    const newEntry = {
      id: `vac-${Date.now()}`,
      name: newVacName.trim(),
      date: newVacDate || new Date().toISOString().split('T')[0],
      nextDue: newVacNextDue || '',
      vet: newVacVet.trim() || '',
      status: 'applied'
    };
    setFormData(prev => ({
      ...prev,
      vaccines: [...(prev.vaccines || []), newEntry],
      vaccinated: 'Sí, al día'
    }));
    setNewVacName('');
    setNewVacNextDue('');
    setNewVacVet('');
    setShowAddVaccine(false);
  };

  const handleRemoveVaccine = (vacId) => {
    setFormData(prev => ({
      ...prev,
      vaccines: (prev.vaccines || []).filter(v => v.id !== vacId)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const compressedBase64 = await compressImageFile(file);
        setFormData(prev => ({ ...prev, photo: compressedBase64 }));
      } catch (err) {
        console.error('Error compressing image:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSelectBreedFromModal = (breedItem) => {
    setFormData(prev => {
      // If photo was default or not a custom uploaded image, adopt the breed's photo!
      const isDefaultPhoto =
        prev.photo.startsWith('/assets/') ||
        prev.photo.includes('unsplash') ||
        prev.photo === '/assets/puppy-hero.jpg' ||
        prev.photo === '/assets/cat-hero.jpg';

      return {
        ...prev,
        breed: breedItem.name,
        photo: isDefaultPhoto && breedItem.photo ? breedItem.photo : prev.photo
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Debes iniciar sesión o crear tu cuenta para publicar esta mascota.');
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!formData.name.trim()) {
      setError('Por favor ingresa el nombre de la mascota.');
      return;
    }
    if (!formData.owner.phone.trim()) {
      setError('Por favor ingresa un teléfono con WhatsApp para emergencias.');
      return;
    }

    // Format Venezuelan +58 phone number for 100% WhatsApp compatibility
    let rawDigits = (formData.owner.phone || '').replace(/[^0-9]/g, '');
    let cleanDigits = rawDigits;
    if (rawDigits.startsWith('0')) {
      cleanDigits = '58' + rawDigits.substring(1);
    } else if (!rawDigits.startsWith('58')) {
      cleanDigits = '58' + rawDigits;
    }

    const internationalPhone = `+${cleanDigits}`;
    const localPart = cleanDigits.substring(2);
    const prettyPhone = localPart.length >= 10
      ? `+58 (${localPart.substring(0, 3)}) ${localPart.substring(3, 6)}-${localPart.substring(6)}`
      : `+${cleanDigits}`;

    let prettyAlt = formData.owner.altPhone;
    if (formData.owner.altPhone) {
      let rawAlt = formData.owner.altPhone.replace(/[^0-9]/g, '');
      if (rawAlt.startsWith('0')) rawAlt = '58' + rawAlt.substring(1);
      else if (!rawAlt.startsWith('58')) rawAlt = '58' + rawAlt;
      prettyAlt = `+${rawAlt}`;
    }

    const computedAge = formData.birthDate ? calculateAgeFromBirthDate(formData.birthDate) : (formData.age || '');

    const updatedPet = {
      ...formData,
      breed: formData.breed || (formData.species === 'dog' ? 'Siberian Husky' : 'Mestizo / Común'),
      birthDate: formData.birthDate || null,
      age: computedAge || formData.age || 'Edad no especificada',
      vaccines: Array.isArray(formData.vaccines) ? formData.vaccines : [],
      ownerId: formData.ownerId || currentUser?.uid || null,
      ownerEmail: formData.ownerEmail || currentUser?.email || '',
      owner: {
        ...formData.owner,
        name: formData.owner.name || currentUser?.displayName || 'Dueño Responsable',
        phone: internationalPhone,
        phoneFormatted: prettyPhone,
        altPhone: prettyAlt || ''
      }
    };

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    onSave(updatedPet);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">
              {isEditing ? `Editar datos de ${initialPet.name}` : 'Registrar Nueva Mascota'}
            </h3>
            <p className="modal-sub">
              Genera su placa QR oficial con perfil inteligente
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

        {error && (
          <div className="modal-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!currentUser && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '16px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                Debes iniciar sesión o registrarte para publicar tu mascota
              </span>
            </div>
            <button
              type="button"
              onClick={onRequireAuth}
              style={{
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pet-registration-form">
          {/* SECCIÓN 1: FOTO Y DATOS BÁSICOS */}
          <div className="form-card-section">
            <div className="form-section-header">
              <Sparkles size={16} color="#D97706" />
              <span>1. Perfil de la Mascota</span>
            </div>

            {/* Photo Selector */}
            <div className="form-group photo-uploader-group">
              <label className="form-label">Foto de Identificación</label>
              <div className="photo-uploader-row">
                <img
                  src={formData.photo}
                  alt="Vista previa"
                  className="photo-preview-thumbnail"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = formData.species === 'dog' ? '/assets/puppy-hero.jpg' : '/assets/cat-hero.jpg';
                  }}
                />
                <div className="photo-actions-block">
                  <label className="btn-upload-file">
                    <Upload size={14} />
                    <span>{isCompressing ? 'Optimizando foto...' : 'Subir foto desde galería'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isCompressing}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span className="photo-hint-text">O elige un avatar rápido con foto:</span>
                </div>
              </div>

              {/* Avatar Presets */}
              <div className="avatar-presets-strip">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setFormData(prev => ({ ...prev, photo: av.url }))}
                    className={`avatar-preset-btn ${formData.photo === av.url ? 'active' : ''}`}
                  >
                    <img src={av.url} alt={av.label} className="preset-img" />
                    <span>{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre y Especie */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre de la Mascota *</label>
                <input
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Balto, Winston, Cleo"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Especie</label>
                <select
                  className="form-select"
                  name="species"
                  value={formData.species}
                  onChange={(e) => {
                    const newSpecies = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      species: newSpecies,
                      breed: '',
                      photo: newSpecies === 'cat' ? '/assets/cat-hero.jpg' : '/assets/husky.jpg'
                    }));
                  }}
                >
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                </select>
              </div>
            </div>

            {/* Selector de Raza con Modal y Fotos */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Raza ({formData.species === 'dog' ? 'Canina' : 'Felina'}) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsBreedPickerOpen(true)}
                  className="btn-open-breed-picker"
                  id="btn-open-breed-picker"
                >
                  <Sparkles size={13} color="#D97706" />
                  <span>Explorar Razas con Fotos</span>
                </button>
              </div>

              {/* Interactive Breed Selection Card */}
              <div
                className="breed-select-box"
                onClick={() => setIsBreedPickerOpen(true)}
                title="Abrir catálogo visual de razas"
              >
                <div className="breed-select-info">
                  <img
                    src={formData.photo || (formData.species === 'dog' ? '/assets/husky.jpg' : '/assets/cat-hero.jpg')}
                    alt="Raza seleccionada"
                    className="breed-select-thumb"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = formData.species === 'dog' ? '/assets/puppy-hero.jpg' : '/assets/cat-hero.jpg';
                    }}
                  />
                  <div>
                    <div className="breed-select-title">
                      {formData.breed || 'Toca aquí para elegir raza con foto...'}
                    </div>
                    <div className="breed-select-sub">
                      {formData.breed
                        ? 'Toca para cambiar o buscar otra raza'
                        : 'Husky, Bulldog Inglés, Francés, Pastor Alemán, etc.'}
                    </div>
                  </div>
                </div>

                <div className="breed-select-action-badge">
                  <span>Cambiar</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Sugerencias en chips */}
              <div className="breed-suggestions-row">
                <span className="suggestions-tag">Sugerencias:</span>
                {popularQuickBreeds.map((quickB) => {
                  const matched = currentCatalog.find(b => b.name.toLowerCase() === quickB.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={quickB}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          breed: quickB,
                          photo: (prev.photo.startsWith('/assets/') || prev.photo.includes('unsplash')) && matched?.photo
                            ? matched.photo
                            : prev.photo
                        }));
                      }}
                      className={`breed-chip ${formData.breed === quickB ? 'active' : ''}`}
                    >
                      {quickB}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fecha de Nacimiento con Cálculo Dinámico de Edad + Sexo */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1.4 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} color="#D97706" />
                    <span>Fecha de Nacimiento *</span>
                  </span>
                  {formData.age && (
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 800, animation: 'fadeIn 0.2s ease' }}>
                      ✓ Edad calculada
                    </span>
                  )}
                </label>

                <div className="birthdate-age-row">
                  <input
                    type="date"
                    className="form-input birthdate-input-field"
                    name="birthDate"
                    value={formData.birthDate || ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleBirthDateChange}
                  />

                  {formData.age ? (
                    <div className="computed-age-pill" title="Edad calculada desde su fecha de nacimiento">
                      <Sparkles size={13} color="#D97706" className="sparkle-spin-subtle" />
                      <span className="computed-age-val">{formData.age}</span>
                    </div>
                  ) : (
                    <div className="computed-age-pill-placeholder" title="Indica la fecha para calcular la edad">
                      <span>Selecciona fecha</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ flex: 0.8 }}>
                <label className="form-label">Sexo</label>
                <select
                  className="form-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: SALUD E IDENTIFICACIÓN */}
          <div className="form-card-section">
            <div className="form-section-header">
              <ShieldCheck size={16} color="#059669" />
              <span>2. Salud & Microchip</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estado de Vacunación</label>
                <select
                  className="form-select"
                  name="vaccinated"
                  value={formData.vaccinated}
                  onChange={handleChange}
                >
                  <option value="Sí, al día">Sí, al día</option>
                  <option value="En proceso">En proceso</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Microchip ID (Opcional)</label>
                <input
                  className="form-input"
                  name="microchip"
                  value={formData.microchip}
                  onChange={handleChange}
                  placeholder="Ej. 982-0192-VE"
                />
              </div>
            </div>

            {/* Historial de Vacunación Interactivo - SIEMPRE VISIBLE */}
            <div className="vaccine-manager-box" style={{ background: '#FFFFFF', border: '1.5px solid #10B981', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Syringe size={18} color="#059669" />
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#065F46' }}>
                    Registrar Vacunas con Fechas
                  </span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857', background: '#D1FAE5', padding: '3px 10px', borderRadius: '8px' }}>
                  {formData.vaccines?.length || 0} registrada(s)
                </span>
              </div>

              {/* Sugerencias Rápidas de Vacunas */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                  Sugerencias rápidas (toca una para autocompletar el nombre):
                </div>
                <div className="vaccine-preset-pills">
                  {(formData.species === 'dog'
                    ? ['Antirrábica', 'Séxtuple / DHPPI-L', 'Parvovirus', 'Bordetella', 'Desparasitación Interna', 'Desparasitación Externa']
                    : ['Triple Felina', 'Antirrábica Felina', 'Leucemia (FeLV)', 'Desparasitación Interna', 'Pipeta Externa']
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewVacName(preset)}
                      className={`vaccine-preset-chip ${newVacName === preset ? 'active' : ''}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos de Entrada Directos: Nombre, Fecha Aplicación, Próximo Refuerzo, Veterinario */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                    Nombre de la Vacuna / Dosis *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Antirrábica, Séxtuple, Parvovirus..."
                    value={newVacName}
                    onChange={(e) => setNewVacName(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                    Fecha de Aplicación *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={newVacDate}
                    onChange={(e) => setNewVacDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                    Próximo Refuerzo (Opcional)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={newVacNextDue}
                    onChange={(e) => setNewVacNextDue(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1.3 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                    Clínica o Veterinario (Opcional)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Dra. Martínez • Vet Caracas"
                    value={newVacVet}
                    onChange={(e) => setNewVacVet(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddVaccine}
                disabled={!newVacName.trim()}
                className="btn-add-vaccine-save"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px', marginTop: '4px' }}
              >
                <Plus size={16} />
                <span>+ Agregar Esta Vacuna al Carnet</span>
              </button>

              {/* Lista de vacunas registradas en la mascota */}
              <div style={{ marginTop: '16px', borderTop: '1.5px solid #F1F5F9', paddingTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  Vacunas registradas en esta ficha:
                </div>

                {(!formData.vaccines || formData.vaccines.length === 0) ? (
                  <div className="vaccine-empty-hint">
                    <Syringe size={16} color="#A8A29E" />
                    <span>Aún no has agregado vacunas. Escribe el nombre y fecha arriba y presiona "+ Agregar Esta Vacuna al Carnet".</span>
                  </div>
                ) : (
                  <div className="vaccine-items-stack">
                    {formData.vaccines.map((vac) => (
                      <div key={vac.id} className="vaccine-item-card">
                        <div className="vac-left-info">
                          <div className="vac-item-badge">
                            <CheckCircle2 size={14} color="#059669" />
                            <span className="vac-name">{vac.name}</span>
                          </div>
                          <div className="vac-meta-dates">
                            <span title="Fecha de aplicación">📅 Aplicada: <strong>{vac.date}</strong></span>
                            {vac.nextDue && (
                              <span className="vac-next-tag" title="Próximo refuerzo programado">
                                ⏳ Refuerzo: {vac.nextDue}
                              </span>
                            )}
                            {vac.vet && <span className="vac-vet-tag">🏥 {vac.vet}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVaccine(vac.id)}
                          className="vac-delete-btn"
                          title="Eliminar esta vacuna"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0, marginTop: '12px' }}>
              <label className="form-label">Alergias o Cuidados Médicos</label>
              <textarea
                className="form-textarea"
                name="medicalNotes"
                rows={2}
                value={formData.medicalNotes}
                onChange={handleChange}
                placeholder="Ej. Alérgico al pollo, medicación especial, muy tímido..."
              />
            </div>
          </div>

          {/* SECCIÓN 3: CONTACTO DE EMERGENCIA */}
          <div className="form-card-section emergency-highlight-section">
            <div className="form-section-header emergency-header-text">
              <Phone size={16} color="#C2410C" />
              <span>3. Contacto del Dueño (Emergencias)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Dueño / Responsable *</label>
              <input
                className="form-input"
                name="owner.name"
                value={formData.owner.name}
                onChange={handleChange}
                placeholder="Ej. Valentina Gómez"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono WhatsApp (Venezuela) *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#B45309',
                    background: '#FEF3C7',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    letterSpacing: '0.3px'
                  }}>
                    +58
                  </span>
                  <input
                    className="form-input"
                    style={{ paddingLeft: '56px' }}
                    name="owner.phone"
                    value={formData.owner.phone}
                    onChange={handleChange}
                    placeholder="412 1234567 / 0412..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono Secundario (Opcional)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#78716C',
                    background: '#F5EFE6',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    letterSpacing: '0.3px'
                  }}>
                    +58
                  </span>
                  <input
                    className="form-input"
                    style={{ paddingLeft: '56px' }}
                    name="owner.altPhone"
                    value={formData.owner.altPhone}
                    onChange={handleChange}
                    placeholder="414 7654321..."
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ciudad / Sector habitual</label>
                <input
                  className="form-input"
                  name="owner.address"
                  value={formData.owner.address}
                  onChange={handleChange}
                  placeholder="Ej. Altamira, Caracas"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Recompensa (Opcional)</label>
                <input
                  className="form-input"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  placeholder="Ej. Recompensa garantizada"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-pill-action"
            style={{ width: '100%', marginTop: '4px' }}
          >
            <div className="btn-pill-icon-circle">
              <Check size={20} strokeWidth={3} />
            </div>
            <span className="btn-pill-text">
              {isEditing ? 'Guardar Cambios' : 'Generar Placa QR Ahora'}
            </span>
          </button>
        </form>
      </div>

      {/* Modal Secundario: Selector Visual de Razas con Fotos */}
      {isBreedPickerOpen && (
        <BreedPickerModal
          species={formData.species}
          currentBreed={formData.breed}
          onSelectBreed={handleSelectBreedFromModal}
          onClose={() => setIsBreedPickerOpen(false)}
        />
      )}
    </div>
  );
}
