import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DOG_BREEDS, CAT_BREEDS } from '../data/breedsData';

const PRESET_AVATARS = [
  { label: 'Golden Retriever', url: '/assets/puppy-hero.jpg' },
  { label: 'Bulldog Francés', url: '/assets/frenchie.jpg' },
  { label: 'Gata Siamesa', url: '/assets/siamese.jpg' },
  { label: 'Scottish Fold', url: '/assets/cat-hero.jpg' },
  { label: 'Welsh Corgi', url: '/assets/corgi-hero.jpg' }
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

    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    onSave(updatedPet);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917' }}>
              {isEditing ? `Editar datos de ${initialPet.name}` : 'Registrar Nueva Mascota'}
            </h3>
            <p style={{ fontSize: '13px', color: '#78716C' }}>
              Genera su placa QR con perfil inteligente
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F5F5F4',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#78716C'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Photo Selector */}
          <div className="form-group">
            <label className="form-label">Foto de la Mascota</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <img
                src={formData.photo}
                alt="Vista previa"
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  objectFit: 'cover',
                  border: '2px solid #FFA800'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #F3E8D6',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1C1917',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <Upload size={14} />
                  <span>Subir foto desde galería</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <div style={{ fontSize: '11px', color: '#A8A29E' }}>O elige una foto recomendada:</div>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData(prev => ({ ...prev, photo: av.url }))}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    border: formData.photo === av.url ? '2px solid #FFA800' : '1px solid #E7E5E4',
                    background: formData.photo === av.url ? '#FFF4DC' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <img src={av.url} alt={av.label} style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1C1917' }}>{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre y Especie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
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

          {/* Raza con Autocompletado Extenso y Datalist */}
          <div className="form-group">
            <label className="form-label">
              Raza ({formData.species === 'dog' ? 'Canina' : 'Felina'}) - Elige o escribe
            </label>
            <input
              className="form-input"
              name="breed"
              list="breeds-datalist"
              value={formData.breed}
              onChange={handleChange}
              placeholder={formData.species === 'dog' ? 'Ej. Golden Retriever, Bulldog Francés...' : 'Ej. Siamés, Persa, Scottish Fold...'}
            />
            <datalist id="breeds-datalist">
              {currentBreedsList.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>

            {/* Accesos rápidos a razas populares */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#A8A29E', alignSelf: 'center' }}>Sugerencias:</span>
              {popularQuickBreeds.map((quickB) => (
                <button
                  type="button"
                  key={quickB}
                  onClick={() => setFormData(prev => ({ ...prev, breed: quickB }))}
                  style={{
                    background: formData.breed === quickB ? '#FFA800' : '#F5EFE6',
                    color: formData.breed === quickB ? '#FFFFFF' : '#44403C',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {quickB}
                </button>
              ))}
            </div>
          </div>

          {/* Edad y Sexo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

          {/* Vacunación y Microchip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Vacunado</label>
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

          {/* Recompensa */}
          <div className="form-group">
            <label className="form-label">Recompensa en caso de extravío (Opcional)</label>
            <input
              className="form-input"
              name="reward"
              value={formData.reward}
              onChange={handleChange}
              placeholder="Ej. Se gratificará generosamente"
            />
          </div>

          {/* Datos del Dueño para Emergencias */}
          <div style={{
            background: '#FFF8EC',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid #F3E8D6',
            margin: '12px 0 16px 0'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917', marginBottom: '10px', textTransform: 'uppercase' }}>
              Contacto del Dueño (Emergencias)
            </h4>

            <div className="form-group">
              <label className="form-label">Nombre del Dueño *</label>
              <input
                className="form-input"
                name="owner.name"
                value={formData.owner.name}
                onChange={handleChange}
                placeholder="Ej. Valentina Gómez"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
          </div>

          {/* Cuidados Especiales */}
          <div className="form-group">
            <label className="form-label">Cuidados Médicos o Alergias</label>
            <textarea
              className="form-textarea"
              name="medicalNotes"
              rows={2}
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="Ej. Alérgico a ciertos alimentos, medicación diaria..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-pill-action"
            style={{ marginTop: '10px', width: '100%' }}
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
