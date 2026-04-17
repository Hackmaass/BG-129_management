import { 
    getFirestore, 
    doc, 
    onSnapshot, 
    collection, 
    query, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import firebaseConfig from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Listen to a user's cart in real-time
 * @param {string} userId 
 * @param {Function} callback 
 */
export const listenToCart = (userId, callback) => {
    if (!userId) return null;
    const cartRef = doc(db, "carts", userId);
    return onSnapshot(cartRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            callback({ items: [], updatedAt: new Date().toISOString() });
        }
    }, (error) => {
        console.error("Error listening to cart:", error);
    });
};

/**
 * Listen to trending products in real-time
 * @param {Function} callback 
 */
export const listenToTrending = (callback) => {
    const productsRef = collection(db, "products");
    const trendingQuery = query(productsRef, orderBy("rating", "desc"), limit(4));
    
    return onSnapshot(trendingQuery, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(products);
    }, (error) => {
        console.error("Error listening to trending products:", error);
    });
};

export { db };
