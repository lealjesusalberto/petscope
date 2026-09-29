import React, { useState } from 'react';
import {
  Search, Plus, QrCode, ExternalLink, Edit3, ShieldAlert,
  ShieldCheck, MapPin, Sparkles, Filter, CheckCircle2, Heart
} from 'lucide-react';

export default function DashboardView({
  pets,
  onSelectPet,
  onOpenQr,
  onAddNewPet,
  onEditPet,
  onToggleStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // all | dog | cat

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.owner?.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' || pet.species === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const lostCount = pets.filter((p) => p.status === 'lost').length;

  return (
    <div className="dashboard-page">
      {/* Top Banner & Header */}
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <div className="user-avatar-badge">
            <Heart size={22} color="#FFFFFF" />
          </div>
          <div>
            <div className="greeting-sub">Panel de Control</div>
            <h1 className="greeting-title">Mis Mascotas Registradas</h1>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="dashboard-stats-strip">
          <div className="stat-pill">
            <span className="stat-num">{pets.length}</span>
            <span className="stat-label">Placas</span>
          </div>
          {lostCount > 0 && (
            <div className="stat-pill lost-alert">
              <ShieldAlert size={14} />
              <span className="stat-num">{lostCount}</span>
              <span className="stat-label">Extraviado</span>
            </div>
          )}
          <button className="btn-add-desktop" onClick={onAddNewPet}>
            <Plus size={18} strokeWidth={2.8} />
            <span>Nueva Placa QR</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="dashboard-toolbar">
        {/* Search Input Bar */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, raza o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Category Pills */}
        <div className="category-pills-group">
          <button
            onClick={() => setActiveCategory('all')}
            className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
          >
            Todas ({pets.length})
          </button>

          <button
            onClick={() => setActiveCategory('dog')}
            className={`cat-pill ${activeCategory === 'dog' ? 'active' : ''}`}
          >
            Perros ({pets.filter(p => p.species === 'dog').length})
          </button>

          <button
            onClick={() => setActiveCategory('cat')}
            className={`cat-pill ${activeCategory === 'cat' ? 'active' : ''}`}
          >
            Gatos ({pets.filter(p => p.species === 'cat').length})
          </button>
        </div>
      </div>

      {/* Pet Cards Responsive Grid */}
      <div className="pets-grid">
        {filteredPets.map((pet) => (
          <div
            key={pet.id}
            className={`pet-card ${pet.status === 'lost' ? 'status-lost-border' : ''}`}
          >
            {/* Card Top: Photo & Info */}
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
                  {pet.breed} • {pet.age}
                </div>

                <div className="pet-location-text">
                  <MapPin size={13} color="#FFA800" />
                  <span className="location-truncate">
                    {pet.owner?.address || 'Caracas, Venezuela'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
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
                title="Ver lo que ve quien escanea la placa"
              >
                <ExternalLink size={15} />
                <span className="btn-label">Ficha</span>
              </button>

              <button
                onClick={() => onEditPet(pet)}
                className="action-btn edit-btn"
                title="Editar información"
              >
                <Edit3 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filteredPets.length === 0 && (
          <div className="empty-state-box">
            <p className="empty-text">
              No se encontraron mascotas con ese criterio de búsqueda.
            </p>
            <button
              onClick={onAddNewPet}
              className="btn-pill-action empty-add-btn"
            >
              <div className="btn-pill-icon-circle">
                <Plus size={18} />
              </div>
              <span className="btn-pill-text">Registrar Mascota</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
