const { db, collection, getDocs, query, where, addDoc } = require('../config/firebaseAdmin');

/**
 * Run the automation engine for a given event and product
 * @param {string} eventType - 'new_product', 'price_drop', or 'restock'
 * @param {object} productData - The current product data
 */
const runAutomationEngine = async (eventType, productData) => {
    try {
        console.log(`[AutomationEngine] Processing ${eventType} for product: ${productData.title || productData.id}`);

        // Fetch all active automations for this trigger type
        const automationsRef = collection(db, 'automations');
        const q = query(automationsRef, where('trigger', '==', eventType), where('active', '==', true));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return;
        }

        const automations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const automation of automations) {
            if (evaluateConditions(automation.conditions, productData)) {
                await executeAction(automation, productData);
            }
        }
    } catch (error) {
        console.error('[AutomationEngine] Error:', error);
    }
};

/**
 * Evaluate if the product matches the automation conditions
 */
const evaluateConditions = (conditions, productData) => {
    if (!conditions) return true;

    const { category, maxPrice, productId } = conditions;

    // Match Category if defined
    if (category && productData.category !== category) {
        return false;
    }

    // Match maxPrice if defined
    if (maxPrice !== undefined && productData.price > maxPrice) {
        return false;
    }

    // Match productId if defined (mostly for restock specific items)
    if (productId && productData.id !== productId) {
        return false;
    }

    return true;
};

/**
 * Execute the action defined in the automation
 */
const executeAction = async (automation, productData) => {
    const { action, userId } = automation;

    if (action.type === 'notify') {
        await notifyUser(userId, productData, automation.trigger);
    }
};

/**
 * Create a notification for the user
 */
const notifyUser = async (userId, productData, trigger) => {
    let message = '';
    const productTitle = productData.title || 'a product';

    switch (trigger) {
        case 'new_product':
            message = `🚀 New Arrival: ${productTitle} is now available in ${productData.category}!`;
            break;
        case 'price_drop':
            message = `📉 Price Drop! ${productTitle} is now only $${productData.price.toFixed(2)}.`;
            break;
        case 'restock':
            message = `🔥 Back in Stock: ${productTitle} is available again. Grab yours now!`;
            break;
        default:
            message = `Notification for ${productTitle}`;
    }

    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            message,
            productId: productData.id,
            read: false,
            createdAt: new Date().toISOString()
        });
        console.log(`[AutomationEngine] Notified user ${userId} for ${trigger} on ${productData.id}`);
    } catch (error) {
        console.error('[AutomationEngine] Error creating notification:', error);
    }
};

module.exports = {
    runAutomationEngine
};
