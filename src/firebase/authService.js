import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./config";

/**
 * Translate common Firebase Auth errors into friendly Spanish messages
 */
export function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido inhabilitada.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciales incorrectas. Verifica tu correo y contraseña.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta registrada con este correo electrónico.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/popup-closed-by-user":
      return "Se cerró la ventana de autenticación de Google.";
    case "auth/operation-not-allowed":
      return "Este método de inicio de sesión no está habilitado en la consola de Firebase.";
    default:
      return "Error de autenticación. Intenta nuevamente.";
  }
}

/**
 * List of officially authorized Administrator UIDs (configured via .env or VITE_ADMIN_UIDS)
 * Example in .env.local: VITE_ADMIN_UIDS=uid1,uid2
 */
export const ADMIN_UIDS = (import.meta.env.VITE_ADMIN_UIDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

/**
 * Check if a user is an administrator based on verified UID or Firestore role
 */
export function isUserAdmin(user) {
  if (!user || !user.uid) return false;
  const isUidAdmin = ADMIN_UIDS.includes(user.uid);
  return Boolean(user.role === 'admin' || isUidAdmin);
}

/**
 * Sync user profile to 'users' collection in Firestore with roles
 * All records and permissions are strictly keyed by UID
 */
export async function syncUserToFirestore(authUser) {
  if (!authUser) return null;
  try {
    const userRef = doc(db, "users", authUser.uid);
    const snap = await getDoc(userRef);

    const isUidAdmin = ADMIN_UIDS.includes(authUser.uid);
    const hasAdminRoleInDb = snap.exists() && snap.data()?.role === "admin";
    const isAdmin = Boolean(isUidAdmin || hasAdminRoleInDb);

    const userData = {
      uid: authUser.uid,
      email: authUser.email || "",
      displayName: authUser.displayName || authUser.email?.split("@")[0] || "Usuario",
      photoURL: authUser.photoURL || null,
      role: snap.exists() ? (snap.data().role || (isAdmin ? "admin" : "user")) : (isAdmin ? "admin" : "user"),
      lastLogin: new Date().toISOString()
    };

    if (!snap.exists()) {
      userData.createdAt = new Date().toISOString();
    }

    await setDoc(userRef, userData, { merge: true });
    return userData;
  } catch (err) {
    console.warn("Could not sync user to Firestore users collection:", err);
    return {
      uid: authUser.uid,
      email: authUser.email,
      role: isUserAdmin(authUser) ? "admin" : "user"
    };
  }
}

/**
 * Log in with email & password
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await syncUserToFirestore(userCredential.user);
  }
  return userCredential;
}

/**
 * Register with email, password, and display name
 */
export async function registerWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  if (userCredential.user) {
    await syncUserToFirestore(userCredential.user);
  }
  return userCredential;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  if (userCredential.user) {
    await syncUserToFirestore(userCredential.user);
  }
  return userCredential;
}

/**
 * Sign out current user
 */
export async function logout() {
  return await signOut(auth);
}

/**
 * Subscribe to auth state changes and enrich with role
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await syncUserToFirestore(user);
      user.role = profile?.role || (isUserAdmin(user) ? "admin" : "user");
      user.phone = profile?.phone || "";
      user.address = profile?.address || "";
      callback(user);
    } else {
      callback(null);
    }
  });
}

/**
 * Update authenticated user's profile and save extra metadata to Firestore
 */
export async function updateUserProfile({ displayName, photoURL, phone, address }) {
  if (!auth.currentUser) throw new Error("No hay usuario autenticado.");

  // 1. Update Firebase Auth Profile
  const authUpdates = {};
  if (displayName !== undefined && displayName !== null) {
    authUpdates.displayName = displayName.trim();
  }
  if (photoURL !== undefined) {
    authUpdates.photoURL = photoURL;
  }
  if (Object.keys(authUpdates).length > 0) {
    await updateProfile(auth.currentUser, authUpdates);
  }

  // 2. Update Firestore user document
  const userRef = doc(db, "users", auth.currentUser.uid);
  const extraData = {
    displayName: auth.currentUser.displayName || "",
    photoURL: auth.currentUser.photoURL || null,
    updatedAt: new Date().toISOString()
  };
  if (phone !== undefined) extraData.phone = phone.trim();
  if (address !== undefined) extraData.address = address.trim();

  try {
    await setDoc(userRef, extraData, { merge: true });
  } catch (err) {
    console.warn("Could not persist extra profile fields to Firestore:", err);
  }

  return {
    ...auth.currentUser,
    displayName: auth.currentUser.displayName,
    photoURL: auth.currentUser.photoURL,
    phone: extraData.phone,
    address: extraData.address
  };
}

/**
 * Fetch extended profile fields from Firestore for a given user UID
 */
export async function fetchUserFirestoreData(uid) {
  if (!uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Could not fetch user document:", err);
  }
  return null;
}

