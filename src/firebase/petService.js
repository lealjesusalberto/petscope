import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./config";
import { INITIAL_PETS } from "../data/petsData";

const COLLECTION_NAME = "pets";

// Helper to remove any undefined values so Firestore doesn't throw unsupported field errors
function sanitizeForFirestore(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => (value === undefined ? null : value))
  );
}

/**
 * Subscribe to real-time updates of all pets in Firestore
 */
export function subscribeToPets(onSuccess, onError) {
  try {
    const petsRef = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      petsRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is still empty, notify with empty array so UI can fallback/seed
          onSuccess([], true);
          return;
        }

        const petsList = [];
        snapshot.forEach((docSnap) => {
          petsList.push({ id: docSnap.id, ...docSnap.data() });
        });

        onSuccess(petsList, false);
      },
      (err) => {
        console.warn("Firestore onSnapshot warning (likely security rules or offline):", err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up Firestore listener:", error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Fetch a single pet by ID (used for QR scanning in real time!)
 */
export async function fetchPetById(petId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, petId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.warn("Error fetching pet by ID from Firestore:", error);
    return null;
  }
}

/**
 * Save (create or update) a pet in Firestore with full sanitization and size safety
 */
export async function savePetToFirestore(petData, userId = null) {
  const cleanId = petData.id || `pet-${Date.now()}`;
  const petRef = doc(db, COLLECTION_NAME, cleanId);

  // Guarantee photo doesn't exceed Firestore 1MB document limit
  let safePhoto = petData.photo || (petData.species === 'dog' ? '/assets/husky.jpg' : '/assets/cat-hero.jpg');
  if (typeof safePhoto === 'string' && safePhoto.length > 800000) {
    console.warn(`[Firestore] Photo size (${safePhoto.length} chars) is too large for Firestore limit. Using fallback.`);
    safePhoto = petData.species === 'dog' ? '/assets/husky.jpg' : '/assets/cat-hero.jpg';
  }

  const payload = sanitizeForFirestore({
    id: cleanId,
    name: petData.name || '',
    species: petData.species || 'dog',
    breed: petData.breed || (petData.species === 'dog' ? 'Siberian Husky' : 'Mestizo / Común'),
    age: petData.age || '',
    gender: petData.gender || 'Macho',
    vaccinated: petData.vaccinated || 'Sí, al día',
    weight: petData.weight || '',
    color: petData.color || '',
    microchip: petData.microchip || '',
    status: petData.status || 'safe',
    photo: safePhoto,
    about: petData.about || '',
    medicalNotes: petData.medicalNotes || '',
    reward: petData.reward || null,
    ownerId: userId || petData.ownerId || null,
    ownerEmail: petData.ownerEmail || null,
    owner: {
      name: petData.owner?.name || 'Dueño Responsable',
      phone: petData.owner?.phone || '',
      phoneFormatted: petData.owner?.phoneFormatted || petData.owner?.phone || '',
      altPhone: petData.owner?.altPhone || '',
      address: petData.owner?.address || '',
      email: petData.owner?.email || ''
    },
    updatedAt: new Date().toISOString(),
    createdAt: petData.createdAt || new Date().toISOString()
  });

  console.log(`[Firestore] Saving pet ${cleanId} to collection 'pets'...`, payload);
  await setDoc(petRef, payload, { merge: true });
  console.log(`[Firestore] Successfully saved pet ${cleanId} (${payload.name})`);
  return payload;
}

/**
 * Toggle or update pet status (safe / lost) in Firestore
 */
export async function updatePetStatusInFirestore(petId, nextStatus) {
  const petRef = doc(db, COLLECTION_NAME, petId);
  await updateDoc(petRef, {
    status: nextStatus,
    statusUpdatedAt: new Date().toISOString()
  });
}

/**
 * Seed initial sample pets into Firestore if empty
 */
export async function seedInitialPets() {
  const promises = INITIAL_PETS.map((pet) => {
    const petRef = doc(db, COLLECTION_NAME, pet.id);
    return setDoc(petRef, { ...pet, updatedAt: new Date().toISOString() }, { merge: true });
  });

  await Promise.all(promises);
}

/**
 * Fetch all registered users from Firestore 'users' collection (Admin only)
 */
export async function fetchUsersList() {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users = [];
    snapshot.forEach((d) => {
      users.push({ id: d.id, ...d.data() });
    });
    return users;
  } catch (err) {
    console.warn("Could not fetch users list:", err);
    return [];
  }
}

/**
 * Update user role (e.g. promote to 'admin' or set to 'user')
 */
export async function updateUserRole(userId, newRole) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { role: newRole });
}

/**
 * Delete a pet from Firestore
 */
export async function deletePetFromFirestore(petId) {
  const petRef = doc(db, COLLECTION_NAME, petId);
  await deleteDoc(petRef);
}

