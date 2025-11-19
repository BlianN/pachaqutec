import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// Configuración de Firebase (REEMPLAZA con tus credenciales)
const firebaseConfig = {
    apiKey: "AIzaSyBmPQUX0JQS13PPbtPA7QeC9V0ef2ZkcS0",
    authDomain: "pachaqutec-turismo.firebaseapp.com",
    projectId: "pachaqutec-turismo",
    storageBucket: "pachaqutec-turismo.firebasestorage.app",
    messagingSenderId: "360035992776",
    appId: "1:360035992776:web:f753c6ae83f1a0a7f411fd"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

// Proveedores de autenticación
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configuraciones opcionales
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;