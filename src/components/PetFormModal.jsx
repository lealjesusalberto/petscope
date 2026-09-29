import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, Sparkles, Heart, Phone, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DOG_BREEDS, CAT_BREEDS } from '../data/breedsData';

const PRESET_AVATARS = [
  { label: 'Golden', url: '/assets/puppy-hero.jpg' },
  { label: 'Frenchie', url: '/assets/frenchie.jpg' },
  { label: 'Siamés', url: '/assets/siamese.jpg' },
  { label: 'Scottish', url: '/assets/cat-hero.jpg' },
  { label: 'Corgi', url: '/assets/corgi-hero.jpg' }
];

export default function PetFormModal({ initialPet, onSave, onClose }) {
  const isEditing = Boolean(initialPet?.id);

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
    owner: {
      name: initialPet?.owner?.name || '',
      phone: initialPet?.owner?.phone || '',
      phoneFormatted: initialPet?.owner?.phoneFormatted || '',
      altPhone: initialPet?.owner?.altPhone || '',
      address: initialPet?.owner?.address || '',
      email: initialPet?.owner?.email || ''
    }
  });

  const [error, setError] = useState('');

  const currentBreedsList = formData.species === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const popularQuickBreeds = formData.species === 'dog'
    ? ['Mestizo / Criollo', 'Golden Retriever', 'Bulldog Francés', 'Caniche / Poodle', 'Pastor Alemán', 'Corgi']
    : ['Mestizo / Común', 'Siamés', 'Scottish Fold', 'Persa', 'Maine Coon', 'Bengalí'];

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, photo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
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
      breed: formData.breed || (formData.species === 'dog' ? 'Mestizo / Criollo' : 'Mestizo / Común'),
      owner: {
        ...formData.owner,
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
                />
                <div className="photo-actions-block">
                  <label className="btn-upload-file">
                    <Upload size={14} />
                    <span>Subir foto desde galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span className="photo-hint-text">O elige un avatar rápido:</span>
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
                  placeholder="Ej. Max, Bruno, Cleo"
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
                      photo: newSpecies === 'cat' ? '/assets/cat-hero.jpg' : '/assets/puppy-hero.jpg'
                    }));
                  }}
                >
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                </select>
              </div>
            </div>

            {/* Raza */}
            <div className="form-group">
              <label className="form-label">
                Raza ({formData.species === 'dog' ? 'Canina' : 'Felina'})
              </label>
              <input
                className="form-input"
                name="breed"
                list="breeds-datalist"
                value={formData.breed}
                onChange={handleChange}
                placeholder={formData.species === 'dog' ? 'Elige o escribe (Ej. Golden, Poodle...)' : 'Elige o escribe (Ej. Siamés, Persa...)'}
              />
              <datalist id="breeds-datalist">
                {currentBreedsList.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>

              {/* Sugerencias en chips */}
              <div className="breed-suggestions-row">
                <span className="suggestions-tag">Sugerencias:</span>
                {popularQuickBreeds.map((quickB) => (
                  <button
                    type="button"
                    key={quickB}
                    onClick={() => setFormData(prev => ({ ...prev, breed: quickB }))}
                    className={`breed-chip ${formData.breed === quickB ? 'active' : ''}`}
                  >
                    {quickB}
                  </button>
                ))}
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
    </div>
  );
}
