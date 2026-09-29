import React, { useState, useMemo } from 'react';
import { X, Search, Check, Sparkles, Filter, Dog, Cat } from 'lucide-react';
import { DOG_BREEDS_CATALOG, CAT_BREEDS_CATALOG } from '../data/breedsData';

export default function BreedPickerModal({
  species = 'dog',
  currentBreed = '',
  onSelectBreed,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | popular | pequeno | mediano | grande
  const [customBreedInput, setCustomBreedInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isDog = species === 'dog';
  const catalog = isDog ? DOG_BREEDS_CATALOG : CAT_BREEDS_CATALOG;
  const defaultFallbackImg = isDog ? '/assets/puppy-hero.jpg' : '/assets/cat-hero.jpg';

  const filteredBreeds = useMemo(() => {
    return catalog.filter((breed) => {
      const matchesSearch =
        breed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (breed.temperament && breed.temperament.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesTab = true;
      if (activeTab === 'popular') {
        matchesTab = Boolean(breed.popular);
      } else if (activeTab === 'pequeno' || activeTab === 'mediano' || activeTab === 'grande') {
        matchesTab = breed.category === activeTab;
      }

      return matchesSearch && matchesTab;
    });
  }, [catalog, searchTerm, activeTab]);

  const handleSelect = (breedItem) => {
    onSelectBreed(breedItem);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customBreedInput.trim()) {
      onSelectBreed({
        name: customBreedInput.trim(),
        photo: defaultFallbackImg,
        size: 'Mediano'
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content breed-picker-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-row" style={{ paddingBottom: '12px', borderBottom: '1px solid #F0ECE1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}>
              {isDog ? <Dog size={22} /> : <Cat size={22} />}
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>
                Catálogo de Razas {isDog ? 'Caninas' : 'Felinas'}
              </h3>
              <p className="modal-sub" style={{ fontSize: '12px' }}>
                Selecciona la raza con su foto oficial ({catalog.length} razas disponibles)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginTop: '16px', marginBottom: '12px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF'
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: '42px',
              paddingRight: searchTerm ? '38px' : '14px',
              height: '46px',
              background: '#FDFBF7',
              borderColor: '#E7E5E4'
            }}
            placeholder={isDog ? 'Buscar raza... (Husky, Bulldog, Poodle, Golden...)' : 'Buscar raza felina...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9CA3AF'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Categories Chips */}
        {isDog && (
          <div className="breed-filter-chips">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`breed-filter-chip ${activeTab === 'all' ? 'active' : ''}`}
            >
              Todas ({catalog.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`breed-filter-chip ${activeTab === 'popular' ? 'active' : ''}`}
            >
              Populares
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pequeno')}
              className={`breed-filter-chip ${activeTab === 'pequeno' ? 'active' : ''}`}
            >
              Pequeños
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mediano')}
              className={`breed-filter-chip ${activeTab === 'mediano' ? 'active' : ''}`}
            >
              Medianos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('grande')}
              className={`breed-filter-chip ${activeTab === 'grande' ? 'active' : ''}`}
            >
              Grandes
            </button>
          </div>
        )}

        {/* Custom Breed Drawer Toggle */}
        <div style={{ marginTop: '8px', marginBottom: '14px' }}>
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#D97706',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 0',
                textDecoration: 'underline'
              }}
            >
              + ¿No encuentras la raza? Escríbela manualmente
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                className="form-input"
                style={{ height: '40px', fontSize: '13px' }}
                placeholder="Nombre de la raza personalizada..."
                value={customBreedInput}
                onChange={(e) => setCustomBreedInput(e.target.value)}
              />
              <button
                type="submit"
                style={{
                  background: '#FFA800',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 16px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Usar
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                style={{
                  background: '#F5F5F4',
                  color: '#78716C',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 12px',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Visual Breeds Grid */}
        <div className="breed-cards-scroll-area">
          {filteredBreeds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#78716C' }}>
              <Sparkles size={32} color="#D97706" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontWeight: 700, fontSize: '15px', color: '#1C1917' }}>No encontramos coincidencias</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Prueba con otro término o utiliza la opción de escribir la raza manualmente arriba.
              </p>
            </div>
          ) : (
            <div className="breed-cards-grid">
              {filteredBreeds.map((breed) => {
                const isSelected = currentBreed.toLowerCase() === breed.name.toLowerCase();
                return (
                  <div
                    key={breed.id}
                    className={`breed-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(breed)}
                  >
                    <div className="breed-card-img-wrapper">
                      <img
                        src={breed.photo}
                        alt={breed.name}
                        className="breed-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = defaultFallbackImg;
                        }}
                      />
                      {isSelected && (
                        <div className="breed-card-check-badge">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      {breed.size && (
                        <span className="breed-card-size-tag">
                          {breed.size}
                        </span>
                      )}
                    </div>

                    <div className="breed-card-content">
                      <div className="breed-card-name" title={breed.name}>
                        {breed.name}
                      </div>
                      {breed.temperament && (
                        <div className="breed-card-temperament" title={breed.temperament}>
                          {breed.temperament}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          paddingTop: '12px',
          marginTop: '12px',
          borderTop: '1px solid #F0ECE1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#78716C'
        }}>
          <span>Mostrando {filteredBreeds.length} de {catalog.length} razas</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F5F5F4',
              color: '#1C1917',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
