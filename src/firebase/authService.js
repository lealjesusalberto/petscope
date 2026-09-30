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
    const existingData = snap.exists() ? snap.data() : {};

    const userData = {
      uid: authUser.uid,
      email: authUser.email || "",
      displayName: authUser.displayName || existingData.displayName || authUser.email?.split("@")[0] || "Usuario",
      photoURL: existingData.photoURL || authUser.photoURL || null,
      phone: existingData.phone || "",
      address: existingData.address || "",
      role: snap.exists() ? (existingData.role || (isAdmin ? "admin" : "user")) : (isAdmin ? "admin" : "user"),
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

const AUTH_CACHE_KEY = 'qpet_cached_auth_user';

/**
 * Retrieve cached user from localStorage for instant, zero-flicker UI render
 */
export function getCachedAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Update cached user in localStorage
 */
export function setCachedAuthUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } else {
      const lightweight = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        photoURL: user.photoURL || null,
        role: user.role || (isUserAdmin(user) ? 'admin' : 'user'),
        phone: user.phone || '',
        address: user.address || ''
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(lightweight));
    }
  } catch (e) {
    console.warn('Could not cache auth user:', e);
  }
}

/**
 * Sign out current user
 */
export async function logout() {
  setCachedAuthUser(null);
  return await signOut(auth);
}

/**
 * Subscribe to auth state changes - instantly reports authenticated user with zero network block
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // 1. Instantly read local cache to prefill role, phone, and address without delay
      const cached = getCachedAuthUser();
      const isAdmin = isUserAdmin(user) || cached?.role === 'admin';

      const instantUser = {
        ...user,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || cached?.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || cached?.photoURL || null,
        role: isAdmin ? 'admin' : 'user',
        phone: cached?.phone || '',
        address: cached?.address || ''
      };

      // 2. Immediately notify the app (0ms delay) so UI never flashes logged-out state
      setCachedAuthUser(instantUser);
      callback(instantUser);

      // 3. Asynchronously sync and enrich with Firestore in background without blocking
      syncUserToFirestore(user).then((profile) => {
        if (profile) {
          const enrichedUser = {
            ...user,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || profile.displayName || instantUser.displayName,
            photoURL: user.photoURL || profile.photoURL || instantUser.photoURL,
            role: profile.role || instantUser.role,
            phone: profile.phone || instantUser.phone || '',
            address: profile.address || instantUser.address || ''
          };
          setCachedAuthUser(enrichedUser);
          callback(enrichedUser);
        }
      }).catch((err) => {
        console.warn('Background syncUserToFirestore error:', err);
      });
    } else {
      setCachedAuthUser(null);
      callback(null);
    }
  });
}

/**
 * Update authenticated user's profile and save extra metadata to Firestore
 */
export async function updateUserProfile({ displayName, photoURL, phone, address }) {
  if (!auth.currentUser) throw new Error("No hay usuario autenticado.");

  // 1. Update Firebase Auth Profile with supported fields only
  const authUpdates = {};
  if (displayName !== undefined && displayName !== null) {
    authUpdates.displayName = displayName.trim();
  }

  // Firebase Auth strictly enforces photoURL length <= 2048 characters (URL only, no base64)
  // If it's a web URL (e.g. Google photo or CDN URL), update Firebase Auth profile
  const isWebUrl = typeof photoURL === 'string' &&
    (photoURL.startsWith('http://') || photoURL.startsWith('https://')) &&
    photoURL.length < 2040;

  if (isWebUrl) {
    authUpdates.photoURL = photoURL;
  }

  if (Object.keys(authUpdates).length > 0) {
    try {
      await updateProfile(auth.currentUser, authUpdates);
    } catch (authErr) {
      console.warn("Could not update Firebase Auth profile attributes:", authErr);
    }
  }

  // 2. Update Firestore user document (Firestore supports base64 image strings up to 1MB!)
  const userRef = doc(db, "users", auth.currentUser.uid);
  const extraData = {
    displayName: displayName !== undefined && displayName !== null ? displayName.trim() : (auth.currentUser.displayName || ""),
    updatedAt: new Date().toISOString()
  };

  if (photoURL !== undefined) {
    extraData.photoURL = photoURL; // Base64 or URL stored cleanly in Firestore
  }
  if (phone !== undefined) {
    extraData.phone = phone.trim();
  }
  if (address !== undefined) {
    extraData.address = address.trim();
  }

  try {
    await setDoc(userRef, extraData, { merge: true });
  } catch (err) {
    console.warn("Could not persist extra profile fields to Firestore:", err);
  }

  const updatedUserObj = {
    ...auth.currentUser,
    displayName: extraData.displayName,
    photoURL: photoURL !== undefined ? photoURL : (auth.currentUser.photoURL || null),
    phone: extraData.phone || '',
    address: extraData.address || '',
    role: isUserAdmin(auth.currentUser) ? 'admin' : 'user'
  };

  setCachedAuthUser(updatedUserObj);
  return updatedUserObj;
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

