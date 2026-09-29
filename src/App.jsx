import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import PetProfileView from './components/PetProfileView';
import QrModal from './components/QrModal';
import PetFormModal from './components/PetFormModal';
import CameraScannerModal from './components/CameraScannerModal';
import { loadPets, savePets } from './data/petsData';
import { Home, Sparkles, QrCode, PlusCircle } from 'lucide-react';

export default function App() {
  const [pets, setPets] = useState(loadPets);
  const [currentView, setCurrentView] = useState('onboarding'); // onboarding | dashboard | profile
  const [selectedPet, setSelectedPet] = useState(null);
  const [qrModalPet, setQrModalPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null); // null when modal closed, false or pet object when open
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [notification, setNotification] = useState('');

  // Handle URL parameters on initial load (e.g. when an actual QR tag is scanned!)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');
    if (petId) {
      const matched = pets.find((p) => p.id === petId);
      if (matched) {
        setSelectedPet(matched);
        setCurrentView('profile');
      }
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

  // Toggle pet lost / safe status
  const handleToggleStatus = (petId) => {
    const updated = pets.map((p) => {
      if (p.id === petId) {
        const nextStatus = p.status === 'lost' ? 'safe' : 'lost';
        showToast(
          nextStatus === 'lost'
            ? `¡Alerta activada! ${p.name} marcado como extraviado.`
            : `¡Excelente noticia! ${p.name} está a salvo en casa.`
        );
        return { ...p, status: nextStatus };
      }
      return p;
    });
    updatePetsList(updated);
    if (selectedPet && selectedPet.id === petId) {
      setSelectedPet(updated.find((p) => p.id === petId));
    }
  };

  // Save pet (add or update)
  const handleSavePet = (savedPet) => {
    const exists = pets.some((p) => p.id === savedPet.id);
    let updated;
    if (exists) {
      updated = pets.map((p) => (p.id === savedPet.id ? savedPet : p));
      showToast(`Datos de ${savedPet.name} actualizados.`);
    } else {
      updated = [savedPet, ...pets];
      showToast(`¡Placa de ${savedPet.name} generada con éxito!`);
    }
    updatePetsList(updated);
    setEditingPet(null);
    setSelectedPet(savedPet);
    setQrModalPet(savedPet); // Directly show their new QR tag!
  };

  // Handle QR scanner detection
  const handleScanSuccess = (decodedText) => {
    setIsScannerOpen(false);
    try {
      // Look for id parameter
      const url = new URL(decodedText, window.location.origin);
      const petId = url.searchParams.get('id');
      if (petId) {
        const found = pets.find((p) => p.id === petId);
        if (found) {
          setSelectedPet(found);
          setCurrentView('profile');
          showToast(`¡Placa de ${found.name} detectada!`);
          return;
        }
      }
    } catch {
      // Fallback: check if text itself is pet id
      const found = pets.find((p) => p.id === decodedText);
      if (found) {
        setSelectedPet(found);
        setCurrentView('profile');
        showToast(`¡Placa de ${found.name} detectada!`);
        return;
      }
    }

    // Default if not matching existing pet
    showToast('Código escaneado: ' + decodedText.substring(0, 35));
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

      {/* Top Navbar (hidden on profile view for full immersion) */}
      {currentView !== 'profile' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onAddNewPet={() => setEditingPet(false)}
        />
      )}

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

      {/* Bottom Floating Navigation (when in dashboard or onboarding) */}
      {currentView !== 'profile' && (
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
      )}

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
    </div>
  );
}
