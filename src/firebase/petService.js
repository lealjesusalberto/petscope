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
 * Save (create or update) a pet in Firestore
 */
export async function savePetToFirestore(petData, userId = null) {
  const cleanId = petData.id || `pet-${Date.now()}`;
  const petRef = doc(db, COLLECTION_NAME, cleanId);

  const payload = {
    ...petData,
    id: cleanId,
    ownerId: userId || petData.ownerId || null,
    updatedAt: new Date().toISOString()
  };

  await setDoc(petRef, payload, { merge: true });
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
