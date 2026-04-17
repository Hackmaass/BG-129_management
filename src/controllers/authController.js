const { db, collection, doc, getDoc, getDocs, setDoc, updateDoc } = require('../config/firebaseAdmin');

/**
 * Sync user profile/metadata to Firestore on registration/first-login
 */
exports.syncProfile = async (req, res, next) => {
    try {
        const { uid, email, displayName } = req.user; // req.user populated by authMiddleware
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const isAdmin = email === 'omkarrane0934@gmail.com'; // Admin bootstrapping
            const userData = {
                uid,
                email,
                name: displayName || email.split('@')[0],
                role: isAdmin ? 'admin' : 'user',
                createdAt: new Date().toISOString()
            };
            await setDoc(userRef, userData);
            return res.status(201).json({ status: 'success', data: userData });
        }

        res.status(200).json({ status: 'success', data: userSnap.data() });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const userRef = doc(db, 'users', req.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            return res.status(404).json({ status: 'error', message: 'User profile not found.' });
        }

        res.status(200).json({ status: 'success', data: userSnap.data() });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const users = snapshot.docs.map(docSnap => docSnap.data());
        res.status(200).json({ status: 'success', data: users });
    } catch (error) {
        next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const docRef = doc(db, 'users', id);
        await updateDoc(docRef, { role });
        
        res.status(200).json({ status: 'success', message: `User ${id} updated to ${role}.` });
    } catch (error) {
        next(error);
    }
};

