const { db, collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc } = require('../config/firebaseAdmin');

/**
 * Create a new automation rule
 */
exports.createAutomation = async (req, res, next) => {
    try {
        const { trigger, conditions, action } = req.body;
        const userId = req.user.uid;

        if (!trigger || !action) {
            return res.status(400).json({ status: 'error', message: 'Trigger and action are required.' });
        }

        const newDocRef = doc(collection(db, 'automations'));
        const automationData = {
            userId,
            trigger,
            conditions: conditions || {},
            action: action || { type: 'notify' },
            active: true,
            createdAt: new Date().toISOString()
        };

        await setDoc(newDocRef, automationData);
        res.status(201).json({ status: 'success', data: { id: newDocRef.id, ...automationData } });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all automations for the authenticated user
 */
exports.getUserAutomations = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const q = query(collection(db, 'automations'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        const automations = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        
        res.status(200).json({
            status: 'success',
            count: automations.length,
            data: automations
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an automation rule
 */
exports.deleteAutomation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const docRef = doc(db, 'automations', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ status: 'error', message: 'Automation not found.' });
        }

        if (docSnap.data().userId !== userId) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized to delete this automation.' });
        }

        await deleteDoc(docRef);
        res.status(200).json({ status: 'success', message: 'Automation deleted.' });
    } catch (error) {
        next(error);
    }
};

/**
 * AI Generate Automation Rule (Bonus)
 * Simply parses a natural language prompt into a structured rule
 */
exports.generateAIAutomation = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ status: 'error', message: 'Prompt is required.' });
        }

        const text = prompt.toLowerCase();
        let trigger = 'new_product';
        let conditions = {};

        // Trigger detection
        if (text.includes('price drop') || text.includes('cheaper') || text.includes('under')) {
            trigger = 'price_drop';
        } else if (text.includes('restock') || text.includes('back in stock') || text.includes('available again')) {
            trigger = 'restock';
        }

        // Category detection
        if (text.includes('hoodie') || text.includes('clothing')) {
            conditions.category = 'clothing';
        } else if (text.includes('sticker') || text.includes('accessory')) {
            conditions.category = 'accessories';
        } else if (text.includes('digital') || text.includes('asset') || text.includes('token')) {
            conditions.category = 'digital';
        }

        // Price detection
        const priceMatch = text.match(/under\s*[₹$]?\s*(\d+)/) || text.match(/[₹$]\s*(\d+)/);
        if (priceMatch) {
            conditions.maxPrice = parseInt(priceMatch[1]);
        }

        res.status(200).json({
            status: 'success',
            data: {
                trigger,
                conditions,
                action: { type: 'notify' },
                description: `Notify me when ${conditions.category || 'products'} ${trigger === 'price_drop' ? 'drop in price' : trigger === 'restock' ? 'are restocked' : 'are added'}${conditions.maxPrice ? ` under $${conditions.maxPrice}` : ''}.`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get unread notifications for the user
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const q = query(
            collection(db, 'notifications'), 
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ status: 'success', data: notifications });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const docRef = doc(db, 'notifications', id);
        await setDoc(docRef, { read: true }, { merge: true });
        res.status(200).json({ status: 'success' });
    } catch (error) {
        next(error);
    }
};
