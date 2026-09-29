import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import PetProfileView from './components/PetProfileView';
import QrModal from './components/QrModal';
import PetFormModal from './components/PetFormModal';
import CameraScannerModal from './components/CameraScannerModal';
import AuthModal from './components/AuthModal';
import { loadPets, savePets, INITIAL_PETS } from './data/petsData';
import { subscribeToAuth, logout } from './firebase/authService';
import {
  subscribeToPets,
  savePetToFirestore,
  updatePetStatusInFirestore,
  fetchPetById,
  seedInitialPets
} from './firebase/petService';
import { Home, Sparkles, QrCode, PlusCircle, Cloud, CloudCheck } from 'lucide-react';

export default function App() {
  const [pets, setPets] = useState(loadPets);
  const [currentView, setCurrentView] = useState('onboarding'); // onboarding | dashboard | profile
  const [selectedPet, setSelectedPet] = useState(null);
  const [qrModalPet, setQrModalPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState('');
  const [cloudSynced, setCloudSynced] = useState(false);

  // Subscribe to Firebase Authentication
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`¡Hola, ${user.displayName || user.email}!`);
      }
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
            const merged = [...firestorePets];
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
    } catch (err) {
      console.error('Error logging out:', err);
    }
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
        onNavigate={(view) => setCurrentView(view)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onAddNewPet={() => setEditingPet(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'onboarding' && (
          <OnboardingView
            onGetStarted={() => setEditingPet(false)}
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
            onAddNewPet={() => setEditingPet(false)}
            onEditPet={(pet) => setEditingPet(pet)}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {currentView === 'profile' && selectedPet && (
          <PetProfileView
            pet={selectedPet}
            onBack={() => setCurrentView('dashboard')}
            onOpenQr={(pet) => setQrModalPet(pet)}
          />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar (Always Visible) */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${currentView === 'onboarding' ? 'active' : ''}`}
          onClick={() => setCurrentView('onboarding')}
        >
          <Sparkles size={20} />
          <span>Inicio</span>
        </button>

        <button
          className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <Home size={20} />
          <span>Mis Placas</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => setIsScannerOpen(true)}
        >
          <QrCode size={20} />
          <span>Escanear</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => setEditingPet(false)}
          style={{ color: '#F57C00' }}
        >
          <PlusCircle size={20} />
          <span>Crear Placa</span>
        </button>
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
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            showToast(`¡Sesión iniciada con éxito!`);
          }}
        />
      )}
    </div>
  );
}
