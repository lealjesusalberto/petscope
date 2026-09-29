import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "./config";

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
 * Log in with email & password
 */
export async function loginWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Register with email, password, and display name
 */
export async function registerWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * Sign out current user
 */
export async function logout() {
  return await signOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
