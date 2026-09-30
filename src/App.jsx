import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import PetProfileView from './components/PetProfileView';
import AdminView from './components/AdminView';
import UserProfileView from './components/UserProfileView';
import QrModal from './components/QrModal';
import PetFormModal from './components/PetFormModal';
import CameraScannerModal from './components/CameraScannerModal';
import AuthModal from './components/AuthModal';
import { loadPets, savePets, INITIAL_PETS } from './data/petsData';
import { subscribeToAuth, logout, isUserAdmin, getCachedAuthUser } from './firebase/authService';
import {
  subscribeToPets,
  savePetToFirestore,
  updatePetStatusInFirestore,
  fetchPetById,
  seedInitialPets
} from './firebase/petService';
import { Home, Sparkles, QrCode, PlusCircle, Plus, Cloud, CloudCheck, ShieldCheck, User } from 'lucide-react';

export default function App() {
  const [pets, setPets] = useState(loadPets);
  const [currentView, setCurrentView] = useState('onboarding'); // onboarding | dashboard | profile
  const [selectedPet, setSelectedPet] = useState(null);
  const [qrModalPet, setQrModalPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCachedAuthUser());
  const [authLoading, setAuthLoading] = useState(() => !getCachedAuthUser());
  const [notification, setNotification] = useState('');
  const [cloudSynced, setCloudSynced] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleStartAddNewPet = () => {
    if (!currentUser) {
      setPendingAction('addNewPet');
      showToast('Crea tu cuenta o inicia sesión para registrar tu mascota.');
      setIsAuthModalOpen(true);
      return;
    }
    setEditingPet(false);
  };

  // Subscribe to Firebase Authentication with instant cache & non-blocking resolution
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to Firestore Real-Time Pets Collection
  useEffect(() => {
    const unsubscribeFirestore = subscribeToPets(
      (firestorePets, isEmpty) => {
        if (isEmpty) {
          // If Firestore collection is empty, auto-seed with initial demo pets
          seedInitialPets().catch((err) => console.warn('Could not auto-seed Firestore:', err));
        } else if (firestorePets && firestorePets.length > 0) {
          setPets((prevPets) => {
            const merged = firestorePets.map((cloudPet) => {
              const defaultMatch = INITIAL_PETS.find((p) => p.id === cloudPet.id);
              return {
                ...cloudPet,
                birthDate: cloudPet.birthDate || defaultMatch?.birthDate || null,
                vaccines: (Array.isArray(cloudPet.vaccines) && cloudPet.vaccines.length > 0)
                  ? cloudPet.vaccines
                  : (defaultMatch?.vaccines || [])
              };
            });
            // Keep any locally created pets that might not be in Firestore yet, and auto-sync them to the cloud
            prevPets.forEach((localPet) => {
              if (!merged.some((cloudPet) => cloudPet.id === localPet.id)) {
                merged.unshift(localPet);
                // Proactively push missing local pet to Firestore
                savePetToFirestore(localPet).catch((err) => {
                  console.warn('Auto-sync of local pet to Firestore failed:', err);
                });
              }
            });
            savePets(merged);
            return merged;
          });
          setCloudSynced(true);
        }
      },
      (err) => {
        console.warn('Working in offline/local mode with localStorage:', err);
        setCloudSynced(false);
      }
    );

    return () => unsubscribeFirestore();
  }, []);

  // Handle URL query parameters on initial load (QR scan direct navigation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');
    if (petId) {
      // First check local list
      const matched = pets.find((p) => p.id === petId);
      if (matched) {
        setSelectedPet(matched);
        setCurrentView('profile');
      }

      // Also fetch directly from Firestore in real-time
      fetchPetById(petId).then((cloudPet) => {
        if (cloudPet) {
          setSelectedPet(cloudPet);
          setCurrentView('profile');
        }
      });
    }
  }, [pets]);

  // Persist pets to localStorage
  const updatePetsList = (newPets) => {
    setPets(newPets);
    savePets(newPets);
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Toggle pet lost / safe status (Local + Firestore sync)
  const handleToggleStatus = async (petId) => {
    const targetPet = pets.find((p) => p.id === petId);
    if (!targetPet) return;

    // Check ownership or admin privileges
    const isOwner = currentUser && (
      (targetPet.ownerId && targetPet.ownerId === currentUser.uid) ||
      (targetPet.ownerEmail && currentUser.email && targetPet.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (targetPet.owner?.email && currentUser.email && targetPet.owner.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    const isAdmin = isUserAdmin(currentUser);

    if (!isOwner && !isAdmin) {
      showToast('Permiso denegado: Solo el dueño de la mascota o el administrador pueden alterar su estado.');
      return;
    }

    const nextStatus = targetPet.status === 'lost' ? 'safe' : 'lost';

    const updated = pets.map((p) => {
      if (p.id === petId) {
        return { ...p, status: nextStatus };
      }
      return p;
    });

    updatePetsList(updated);
    if (selectedPet && selectedPet.id === petId) {
      setSelectedPet(updated.find((p) => p.id === petId));
    }

    showToast(
      nextStatus === 'lost'
        ? `¡Alerta activada! ${targetPet.name} marcado como extraviado.`
        : `¡Excelente noticia! ${targetPet.name} está a salvo en casa.`
    );

    // Sync status change to Firestore
    try {
      await updatePetStatusInFirestore(petId, nextStatus);
    } catch (err) {
      console.warn('Could not sync status to Firestore:', err);
    }
  };

  // Save pet (add or update in Local + Firestore)
  const handleSavePet = async (savedPet) => {
    const exists = pets.some((p) => p.id === savedPet.id);
    if (exists) {
      const existingPet = pets.find((p) => p.id === savedPet.id);
      const isOwner = currentUser && (
        (existingPet.ownerId && existingPet.ownerId === currentUser.uid) ||
        (existingPet.ownerEmail && currentUser.email && existingPet.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (existingPet.owner?.email && currentUser.email && existingPet.owner.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      const isAdmin = isUserAdmin(currentUser);

      if (!isOwner && !isAdmin) {
        showToast('Permiso denegado: Solo el dueño legítimo o el administrador pueden modificar esta mascota.');
        return;
      }
    }

    let updated;
    if (exists) {
      updated = pets.map((p) => (p.id === savedPet.id ? savedPet : p));
      showToast(`Datos de ${savedPet.name} actualizados.`);
    } else {
      updated = [savedPet, ...pets];
      showToast(`¡Placa de ${savedPet.name} guardada con éxito!`);
    }

    updatePetsList(updated);
    setEditingPet(null);
    setSelectedPet(savedPet);
    setQrModalPet(savedPet);
    setCurrentView('dashboard');
    showToast(`Guardando ${savedPet.name}...`);

    // Sync to Firestore in background with feedback
    try {
      await savePetToFirestore(savedPet, currentUser?.uid);
      showToast(`¡${savedPet.name} sincronizado en Firestore!`);
    } catch (err) {
      console.error('[Firestore Error] Could not save to Firestore:', err);
      showToast(`Guardado en este dispositivo (Aviso nube: ${err.message || 'Error'})`);
    }
  };

  // Handle QR scanner detection
  const handleScanSuccess = async (decodedText) => {
    setIsScannerOpen(false);
    let petId = null;

    try {
      const url = new URL(decodedText, window.location.origin);
      petId = url.searchParams.get('id');
    } catch {
      petId = decodedText;
    }

    if (petId) {
      const found = pets.find((p) => p.id === petId);
      if (found) {
        setSelectedPet(found);
        setCurrentView('profile');
        showToast(`¡Placa de ${found.name} detectada!`);
        return;
      }

      // If not in local list, check Firestore in real-time
      const cloudPet = await fetchPetById(petId);
      if (cloudPet) {
        setSelectedPet(cloudPet);
        setCurrentView('profile');
        showToast(`¡Placa de ${cloudPet.name} detectada desde la nube!`);
        return;
      }
    }

    showToast('Código escaneado: ' + decodedText.substring(0, 35));
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sesión cerrada');
      if (currentView === 'admin') {
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleNavigate = (view) => {
    if (view === 'admin' && !isUserAdmin(currentUser)) {
      showToast('Acceso restringido: Solo el Administrador puede ingresar.');
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1C1917',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1.5px solid #FFA800',
          maxWidth: '90%'
        }}>
          <Sparkles size={16} color="#FFA800" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenScanner={() => setIsScannerOpen(true)}
        onAddNewPet={handleStartAddNewPet}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'onboarding' && (
          <OnboardingView
            onGetStarted={handleStartAddNewPet}
            onExploreDemo={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            pets={pets}
            currentUser={currentUser}
            onSelectPet={(pet) => {
              setSelectedPet(pet);
              setCurrentView('profile');
            }}
            onOpenQr={(pet) => setQrModalPet(pet)}
            onAddNewPet={handleStartAddNewPet}
            onEditPet={(pet) => setEditingPet(pet)}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {currentView === 'profile' && selectedPet && (
          <PetProfileView
            pet={selectedPet}
            onBack={() => setCurrentView('dashboard')}
            onOpenQr={(pet) => setQrModalPet(pet)}
            onEditPet={(pet) => setEditingPet(pet)}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            pets={pets}
            currentUser={currentUser}
            onSelectPet={(pet) => {
              setSelectedPet(pet);
              setCurrentView('profile');
            }}
            onOpenQr={(pet) => setQrModalPet(pet)}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'user-profile' && (
          <UserProfileView
            currentUser={currentUser}
            authLoading={authLoading}
            pets={pets}
            onSelectPet={(pet) => {
              setSelectedPet(pet);
              setCurrentView('profile');
            }}
            onOpenQr={(pet) => setQrModalPet(pet)}
            onAddNewPet={handleStartAddNewPet}
            onEditPet={(pet) => setEditingPet(pet)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onToggleStatus={handleToggleStatus}
            onUserUpdated={(updatedUser) => {
              setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
              showToast('¡Perfil actualizado con éxito!');
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar (Always Visible - Luxury Dock Design) */}
      <nav className="bottom-nav" aria-label="Navegación principal">
        <div className="bottom-nav-inner">
          <button
            className={`bottom-nav-item ${currentView === 'onboarding' ? 'active' : ''}`}
            onClick={() => handleNavigate('onboarding')}
            title="Inicio"
          >
            <div className="bottom-nav-icon-wrap">
              <Sparkles size={20} />
            </div>
            <span>Inicio</span>
          </button>

          <button
            className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
            title="Mascotas Registradas"
          >
            <div className="bottom-nav-icon-wrap">
              <Home size={20} />
            </div>
            <span className="bottom-nav-label-desktop">Mascotas Registradas</span>
            <span className="bottom-nav-label-mobile">Mascotas</span>
          </button>

          {/* Elevated Center CTA Button: Crear Placa */}
          <button
            className="bottom-nav-cta-center"
            onClick={handleStartAddNewPet}
            title="Crear Nueva Placa QR Inteligente"
            aria-label="Crear Placa"
          >
            <div className="bottom-nav-cta-halo"></div>
            <div className="bottom-nav-cta-circle">
              <Plus size={22} strokeWidth={2.8} />
            </div>
            <span className="bottom-nav-cta-text">Crear Placa</span>
          </button>

          <button
            className={`bottom-nav-item ${currentView === 'user-profile' ? 'active' : ''}`}
            onClick={() => handleNavigate('user-profile')}
            title="Mi Perfil y Mascotas"
          >
            <div className="bottom-nav-icon-wrap">
              <User size={20} />
            </div>
            <span>Mi Perfil</span>
          </button>

          {isUserAdmin(currentUser) && (
            <button
              className={`bottom-nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavigate('admin')}
              title="Panel Administrador"
            >
              <div className="bottom-nav-icon-wrap">
                <ShieldCheck size={20} />
              </div>
              <span>Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Modals */}
      {qrModalPet && (
        <QrModal
          pet={qrModalPet}
          onClose={() => setQrModalPet(null)}
          onOpenProfile={(pet) => {
            setSelectedPet(pet);
            setCurrentView('profile');
          }}
        />
      )}

      {editingPet !== null && (
        <PetFormModal
          initialPet={editingPet || null}
          currentUser={currentUser}
          onRequireAuth={() => {
            setPendingAction('addNewPet');
            setIsAuthModalOpen(true);
          }}
          onSave={handleSavePet}
          onClose={() => setEditingPet(null)}
        />
      )}

      {isScannerOpen && (
        <CameraScannerModal
          demoPets={pets}
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          initialMode={pendingAction ? 'register' : 'login'}
          customReason={pendingAction === 'addNewPet' ? 'Crea tu cuenta o inicia sesión para registrar tu mascota y activar su placa' : ''}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
          }}
          onSuccess={(user) => {
            showToast(`¡Sesión activa como ${user.displayName || user.email}!`);
            setIsAuthModalOpen(false);
            if (pendingAction === 'addNewPet') {
              setPendingAction(null);
              setEditingPet(false);
            }
          }}
        />
      )}
    </div>
  );
}
