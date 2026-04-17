const { admin, db, doc, getDoc } = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (req.headers['x-user-id']) {
            return next();
        }
        
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: No token provided.',
        });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        req.headers['x-user-id'] = decodedToken.uid;
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Invalid token.',
        });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: User not authenticated.' });
        }

        const userRef = doc(db, 'users', req.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Forbidden: Admin access required.' });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { verifyToken, requireAdmin };
