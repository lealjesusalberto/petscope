import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, ShieldAlert, Users, Dog, AlertTriangle, Search, CheckCircle2,
  ExternalLink, QrCode, ArrowLeft, RefreshCw, Sparkles, User, Key, Eye, Lock
} from 'lucide-react';
import { fetchUsersList, updateUserRole } from '../firebase/petService';
import { isUserAdmin } from '../firebase/authService';
import { calculateAgeFromBirthDate } from '../utils/ageCalculator';

export default function AdminView({ pets, currentUser, onSelectPet, onOpenQr, onBack }) {
  const isAdmin = isUserAdmin(currentUser);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserPets, setSelectedUserPets] = useState(null);
  const [roleUpdating, setRoleUpdating] = useState({});

  const loadUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const users = await fetchUsersList();
      setUsersList(users);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Security gate: Block unauthorized visitors immediately
  if (!isAdmin) {
    return (
      <div style={{
        maxWidth: '520px',
        margin: '60px auto',
        padding: '36px 24px',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #FEE2E2',
        textAlign: 'center',
        boxShadow: '0 12px 32px rgba(220, 38, 38, 0.08)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Lock size={32} color="#DC2626" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', marginBottom: '8px' }}>
          Acceso Restringido a Administradores
        </h2>
        <p style={{ fontSize: '14px', color: '#78716C', lineHeight: 1.5, marginBottom: '24px' }}>
          {currentUser
            ? `Tu cuenta (${currentUser.email}) no cuenta con privilegios de Administrador del sistema Q-pet.`
            : 'Debes iniciar sesión con una cuenta autorizada de Administrador para acceder a este panel.'}
        </p>
        <button
          onClick={onBack}
          style={{
            background: '#1C1917',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Volver a Mascotas Registradas
        </button>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.displayName || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.uid || '').toLowerCase().includes(term)
    );
  });

  // Calculate stats
  const totalUsers = usersList.length;
  const totalPets = pets.length;
  const lostPets = pets.filter((p) => p.status === 'lost').length;
  const safePets = pets.filter((p) => p.status === 'safe').length;

  // Map pets to a user
  const getUserPets = (user) => {
    return pets.filter((p) => {
      const matchUid = p.ownerId && p.ownerId === user.uid;
      const matchEmail = (
        (p.ownerEmail && user.email && p.ownerEmail.toLowerCase() === user.email.toLowerCase()) ||
        (p.owner?.email && user.email && p.owner.email.toLowerCase() === user.email.toLowerCase())
      );
      return Boolean(matchUid || matchEmail);
    });
  };

  const handleToggleUserRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setRoleUpdating(prev => ({ ...prev, [targetUser.uid]: true }));
    try {
      await updateUserRole(targetUser.uid, nextRole);
      setUsersList(prev => prev.map(u => (u.uid === targetUser.uid ? { ...u, role: nextRole } : u)));
    } catch (err) {
      console.error('Error changing role:', err);
    } finally {
      setRoleUpdating(prev => ({ ...prev, [targetUser.uid]: false }));
    }
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px 16px 80px', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            className="profile-circle-btn"
            style={{ width: '40px', height: '40px' }}
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                Panel de Administración
              </h1>
              <span style={{
                background: '#FEF3C7',
                color: '#B45309',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={12} color="#B45309" />
                Rol Admin
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#78716C', marginTop: '3px', margin: 0 }}>
              Supervisión de usuarios registrados, seguridad y mascotas asociadas
            </p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          className="btn-secondary"
          style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={loading ? 'spinning-icon' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '18px', border: '1.5px solid #F0ECE1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#D97706', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#78716C' }}>Usuarios Registrados</span>
            <Users size={18} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917' }}>{totalUsers}</div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>Cuentas en Firebase Auth</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '18px', border: '1.5px solid #F0ECE1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#D97706', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#78716C' }}>Total Placas QR</span>
            <Dog size={18} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917' }}>{totalPets}</div>
          <div style={{ fontSize: '11px', color: '#78716C', fontWeight: 600, marginTop: '4px' }}>Mascotas en Firestore</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '18px', border: '1.5px solid #F0ECE1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#DC2626', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#78716C' }}>Mascotas Extraviadas</span>
            <AlertTriangle size={18} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626' }}>{lostPets}</div>
          <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, marginTop: '4px' }}>Alertas activas</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '18px', border: '1.5px solid #F0ECE1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#059669', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#78716C' }}>Mascotas a Salvo</span>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669' }}>{safePets}</div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>En casa con su familia</div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{ position: 'relative', marginBottom: '18px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '44px', height: '46px', background: '#FFFFFF' }}
          placeholder="Buscar usuarios por nombre, correo electrónico o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Directory Table / Cards */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #F0ECE1', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
            Directorio de Usuarios ({filteredUsers.length})
          </h2>
          <span style={{ fontSize: '12px', color: '#78716C' }}>
            Mostrando usuarios registrados en Firebase
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#78716C' }}>
            <Sparkles size={28} color="#D97706" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontWeight: 700 }}>Cargando usuarios desde Firestore...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#78716C' }}>
            <p style={{ fontWeight: 700, color: '#1C1917', fontSize: '15px' }}>No se encontraron usuarios</p>
            <p style={{ fontSize: '13px' }}>Asegúrate de haber iniciado sesión y registrado cuentas.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#FDFBF7', borderBottom: '1px solid #F0ECE1' }}>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 800, color: '#78716C' }}>USUARIO</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 800, color: '#78716C' }}>ROL</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 800, color: '#78716C' }}>MASCOTAS</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 800, color: '#78716C' }}>ÚLTIMO ACCESO</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 800, color: '#78716C', textAlign: 'right' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userPets = getUserPets(user);
                  const isUserAdminRole = user.role === 'admin';
                  return (
                    <tr key={user.uid || user.id} style={{ borderBottom: '1px solid #F9F6F0' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: isUserAdminRole ? '#FEF3C7' : '#F5EFE6',
                            color: isUserAdminRole ? '#B45309' : '#57534E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px'
                          }}>
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917' }}>
                              {user.displayName || 'Usuario'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#78716C' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleUserRole(user)}
                          disabled={roleUpdating[user.uid]}
                          style={{
                            background: isUserAdminRole ? '#FEF3C7' : '#F3F4F6',
                            color: isUserAdminRole ? '#92400E' : '#4B5563',
                            border: `1px solid ${isUserAdminRole ? '#FDE68A' : '#E5E7EB'}`,
                            borderRadius: '8px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Toca para cambiar rol"
                        >
                          <Key size={11} />
                          <span>{isUserAdminRole ? 'Admin' : 'Usuario'}</span>
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedUserPets({ user, pets: userPets })}
                          style={{
                            background: userPets.length > 0 ? '#ECFDF5' : '#F5F5F4',
                            color: userPets.length > 0 ? '#065F46' : '#78716C',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Dog size={13} />
                          <span>{userPets.length} Mascota{userPets.length === 1 ? '' : 's'}</span>
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '12px', color: '#78716C' }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Reciente'}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedUserPets({ user, pets: userPets })}
                          style={{
                            background: '#FFA800',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={13} />
                          <span>Inspeccionar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User's Pets Inspector Modal */}
      {selectedUserPets && (
        <div className="modal-overlay" onClick={() => setSelectedUserPets(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F0ECE1', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                  Mascotas de {selectedUserPets.user.displayName || selectedUserPets.user.email}
                </h3>
                <p style={{ fontSize: '12px', color: '#78716C', margin: '3px 0 0' }}>
                  {selectedUserPets.user.email} • {selectedUserPets.pets.length} registrada(s)
                </p>
              </div>

              <button
                onClick={() => setSelectedUserPets(null)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            {selectedUserPets.pets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#78716C' }}>
                <Dog size={32} color="#D97706" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontWeight: 700, color: '#1C1917' }}>Este usuario aún no tiene mascotas registradas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '55vh', overflowY: 'auto' }}>
                {selectedUserPets.pets.map((pet) => (
                  <div
                    key={pet.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid #F0ECE1',
                      background: '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={pet.photo}
                        alt={pet.name}
                        style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917' }}>
                          {pet.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#78716C' }}>
                          {pet.breed} • {pet.birthDate ? calculateAgeFromBirthDate(pet.birthDate) : pet.age} • Tel: {pet.owner?.phone}
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: pet.status === 'lost' ? '#DC2626' : '#059669',
                          background: pet.status === 'lost' ? '#FEE2E2' : '#ECFDF5',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          marginTop: '3px',
                          display: 'inline-block'
                        }}>
                          {pet.status === 'lost' ? '¡Extraviado!' : 'A Salvo'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setSelectedUserPets(null);
                          onOpenQr(pet);
                        }}
                        style={{
                          background: '#FEF3C7',
                          color: '#B45309',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <QrCode size={14} />
                        <span>QR</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUserPets(null);
                          onSelectPet(pet);
                        }}
                        style={{
                          background: '#FFA800',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Perfil</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
