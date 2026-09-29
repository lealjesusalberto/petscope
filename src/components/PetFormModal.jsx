import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, Sparkles, Heart, Phone, ShieldCheck, ChevronRight, Dog, Cat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DOG_BREEDS, CAT_BREEDS, DOG_BREEDS_CATALOG, CAT_BREEDS_CATALOG } from '../data/breedsData';
import BreedPickerModal from './BreedPickerModal';

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

// Canvas helper to compress any mobile gallery/camera photo to max 500px JPEG (<50KB)
function compressImageFile(file, maxDimension = 500, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve('/assets/puppy-hero.jpg');
  });
}

export default function PetFormModal({ initialPet, currentUser, onSave, onClose }) {
  const isEditing = Boolean(initialPet?.id);
  const [isBreedPickerOpen, setIsBreedPickerOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const [formData, setFormData] = useState({
    id: initialPet?.id || `pet-${Date.now()}`,
    name: initialPet?.name || '',
    species: initialPet?.species || 'dog',
    breed: initialPet?.breed || '',
    age: initialPet?.age || '',
    gender: initialPet?.gender || 'Macho',
    vaccinated: initialPet?.vaccinated || 'Sí, al día',
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
    if (!formData.name.trim()) {
      setError('Por favor ingresa el nombre de la mascota.');
      return;
    }
    if (!formData.owner.phone.trim()) {
      setError('Por favor ingresa un teléfono con WhatsApp para emergencias.');
      return;
    }

    const updatedPet = {
      ...formData,
      breed: formData.breed || (formData.species === 'dog' ? 'Siberian Husky' : 'Mestizo / Común'),
      ownerId: formData.ownerId || currentUser?.uid || null,
      ownerEmail: formData.ownerEmail || currentUser?.email || '',
      owner: {
        ...formData.owner,
        name: formData.owner.name || currentUser?.displayName || 'Dueño Responsable',
        phoneFormatted: formData.owner.phoneFormatted || formData.owner.phone
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

            {/* Edad y Sexo */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Edad</label>
                <input
                  className="form-input"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Ej. 2 años / 8 meses"
                />
              </div>

              <div className="form-group">
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

            <div className="form-group" style={{ marginBottom: 0 }}>
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
                <label className="form-label">Teléfono WhatsApp *</label>
                <input
                  className="form-input"
                  name="owner.phone"
                  value={formData.owner.phone}
                  onChange={handleChange}
                  placeholder="+58 412 1234567"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono Secundario</label>
                <input
                  className="form-input"
                  name="owner.altPhone"
                  value={formData.owner.altPhone}
                  onChange={handleChange}
                  placeholder="+58 414 7654321"
                />
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
