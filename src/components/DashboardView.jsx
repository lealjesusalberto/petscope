import React, { useState } from 'react';
import {
  Search, Plus, QrCode, ExternalLink, Edit3, ShieldAlert,
  ShieldCheck, MapPin, Sparkles, Filter, CheckCircle2, Heart,
  UserCheck, Users
} from 'lucide-react';

export default function DashboardView({
  pets,
  currentUser,
  onSelectPet,
  onOpenQr,
  onAddNewPet,
  onEditPet,
  onToggleStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // all | dog | cat
  const [ownershipFilter, setOwnershipFilter] = useState('all'); // all | mine

  const isPetMine = (pet) => {
    if (!currentUser) return false;
    const uidMatch = pet.ownerId && pet.ownerId === currentUser.uid;
    const emailMatch = (
      (pet.ownerEmail && currentUser.email && pet.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (pet.owner?.email && currentUser.email && pet.owner.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    return Boolean(uidMatch || emailMatch);
  };

  const myPets = pets.filter(isPetMine);

  // Filter and sort pets: User's own pets appear first!
  const filteredPets = pets
    .filter((pet) => {
      // Ownership filter
      if (ownershipFilter === 'mine' && !isPetMine(pet)) {
        return false;
      }

      // Search match
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.owner?.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Category match
      const matchesCategory =
        activeCategory === 'all' || pet.species === activeCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Put user's own pets at the very top
      const aMine = isPetMine(a) ? 1 : 0;
      const bMine = isPetMine(b) ? 1 : 0;
      return bMine - aMine;
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
            <div className="greeting-sub">
              {currentUser ? `Cuenta: ${currentUser.displayName || currentUser.email}` : 'Panel de Control'}
            </div>
            <h1 className="greeting-title">Mis Mascotas Registradas</h1>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="dashboard-stats-strip">
          {currentUser && (
            <div className="stat-pill" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <UserCheck size={14} />
              <span className="stat-num">{myPets.length}</span>
              <span className="stat-label">Tuyas</span>
            </div>
          )}
          <div className="stat-pill">
            <span className="stat-num">{pets.length}</span>
            <span className="stat-label">Total Placas</span>
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

        {/* Category Pills & Ownership Tabs */}
        <div className="category-pills-group">
          {currentUser && (
            <>
              <button
                onClick={() => setOwnershipFilter('mine')}
                className={`cat-pill ${ownershipFilter === 'mine' ? 'active' : ''}`}
                style={ownershipFilter === 'mine' ? { background: '#D97706', color: '#FFFFFF' } : {}}
              >
                <UserCheck size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                Mis Mascotas ({myPets.length})
              </button>

              <button
                onClick={() => setOwnershipFilter('all')}
                className={`cat-pill ${ownershipFilter === 'all' ? 'active' : ''}`}
              >
                <Users size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                Todas ({pets.length})
              </button>
            </>
          )}

          <span style={{ width: '1px', height: '20px', background: '#E7E5E4', margin: '0 4px' }} />

          <button
            onClick={() => setActiveCategory('all')}
            className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
          >
            Todas
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

      {/* Empty State when ownership filter 'mine' has no pets */}
      {ownershipFilter === 'mine' && filteredPets.length === 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1.5px dashed #D6D3D1',
          margin: '20px 0'
        }}>
          <Sparkles size={40} color="#D97706" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
            Aún no tienes mascotas registradas con tu cuenta
          </h3>
          <p style={{ fontSize: '14px', color: '#78716C', maxWidth: '420px', margin: '0 auto 20px' }}>
            Crea la placa inteligente de tu perro o gato para verla aquí y tener su QR de emergencia siempre activo.
          </p>
          <button
            onClick={onAddNewPet}
            className="btn-pill-action"
            style={{ margin: '0 auto', maxWidth: '260px' }}
          >
            <div className="btn-pill-icon-circle">
              <Plus size={18} strokeWidth={3} />
            </div>
            <span className="btn-pill-text">Crear Placa QR Ahora</span>
          </button>
        </div>
      )}

      {/* Pet Cards Responsive Grid */}
      <div className="pets-grid">
        {filteredPets.map((pet) => {
          const isMine = isPetMine(pet);
          return (
            <div
              key={pet.id}
              className={`pet-card ${pet.status === 'lost' ? 'status-lost-border' : ''} ${isMine ? 'my-pet-card-highlight' : ''}`}
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
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = pet.species === 'dog' ? '/assets/husky.jpg' : '/assets/cat-hero.jpg';
                    }}
                  />
                  {pet.status === 'lost' && (
                    <div className="pet-alert-badge" title="Mascota en búsqueda">
                      !
                    </div>
                  )}
                </div>

                <div className="pet-info-col">
                  {/* Badge if it's the current user's pet */}
                  {isMine && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#FEF3C7',
                      color: '#B45309',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      width: 'fit-content'
                    }}>
                      <Sparkles size={11} color="#B45309" />
                      <span>Tu Mascota</span>
                    </div>
                  )}

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
                  title="Ver perfil completo"
                >
                  <ExternalLink size={15} />
                  <span className="btn-label">Ver Perfil</span>
                </button>

                <button
                  onClick={() => onEditPet(pet)}
                  className="action-btn edit-btn"
                  title="Editar información"
                >
                  <Edit3 size={15} />
                  <span className="btn-label">Editar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
