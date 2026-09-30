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
 * Check if a user is an administrator
 */
export function isUserAdmin(user) {
  if (!user) return false;
  return (
    user.role === 'admin' ||
    user.email?.toLowerCase().includes('admin') ||
    user.email?.toLowerCase() === 'lealjesusalberto@gmail.com'
  );
}

/**
 * Sync user profile to 'users' collection in Firestore with roles
 */
export async function syncUserToFirestore(authUser) {
  if (!authUser) return null;
  try {
    const userRef = doc(db, "users", authUser.uid);
    const snap = await getDoc(userRef);

    const isAdmin =
      authUser.email?.toLowerCase().includes("admin") ||
      authUser.email?.toLowerCase() === "admin@qpet.com" ||
      authUser.email?.toLowerCase() === "lealjesusalberto@gmail.com" ||
      snap.data()?.role === "admin";

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
      callback(user);
    } else {
      callback(null);
    }
  });
}
