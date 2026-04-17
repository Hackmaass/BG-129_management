import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./db-service.js";

/**
 * Listen to a user's notifications in real-time
 * @param {string} userId 
 * @param {Function} callback 
 */
export const listenToNotifications = (userId, callback) => {
    if (!userId) return null;
    
    const notificationsRef = collection(db, "notifications");
    const q = query(
        notificationsRef, 
        where("userId", "==", userId), 
        where("read", "==", false),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(notifications);
    }, (error) => {
        console.error("Error listening to notifications:", error);
    });
};

/**
 * Mark a notification as read via API
 * @param {string} notificationId 
 */
export const markNotificationAsRead = async (notificationId, token) => {
    try {
        await fetch(`/api/automations/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
    }
};
