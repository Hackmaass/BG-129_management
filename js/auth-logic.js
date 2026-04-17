import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
export const registerUser = async (name, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with name
        await updateProfile(user, {
            displayName: name
        });
        
        return { success: true, user };
    } catch (error) {
        console.error("Registration Error:", error.code, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Login existing user
 * @param {string} email 
 * @param {string} password 
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login Error:", error.code, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Logout Error:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback 
 */
export const onAuthChange = (callback) => {
    onAuthStateChanged(auth, callback);
};

export { auth };
