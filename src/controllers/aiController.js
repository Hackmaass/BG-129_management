const { db, collection, getDocs } = require('../config/firebaseAdmin');

exports.getRecommendations = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ status: 'error', message: 'Prompt is required.' });
        }

        const queryText = prompt.toLowerCase();
        
        // Fetch all products from Firestore
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Smart keyword matcher (Mocking LLM behavior)
        const scoredProducts = allProducts.map(product => {
            let score = 0;
            const title = (product.title || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();
            const tags = (product.techStackTags || []).map(t => t.toLowerCase());
            const category = (product.category || '').toLowerCase();

            // Match exact keywords
            if (queryText.includes(title)) score += 10;
            if (queryText.includes(category)) score += 5;
            
            // Match tech tags
            tags.forEach(tag => {
                if (queryText.includes(tag)) score += 8;
            });

            // Contextual matching
            if (queryText.includes('wear') || queryText.includes('clothing') || queryText.includes('shirt') || queryText.includes('hoodie')) {
                if (category === 'clothing') score += 5;
            }
            if (queryText.includes('digital') || queryText.includes('api') || queryText.includes('token')) {
                if (category === 'digital') score += 5;
            }
            if (queryText.includes('sticker') || queryText.includes('mug') || queryText.includes('backpack')) {
                if (category === 'accessories') score += 3;
            }

            return { ...product, score };
        });

        // Sort by score and take top 3
        const recommendations = scoredProducts
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        // If no matches, return a few featured products as fallback
        const finalResults = recommendations.length > 0 
            ? recommendations 
            : allProducts.filter(p => p.featured).slice(0, 3);

        res.status(200).json({
            status: 'success',
            data: finalResults,
            message: recommendations.length > 0 
                ? "I've found some products that match your developer profile!" 
                : "I couldn't find a perfect match, but here are our top picks for engineers like you."
        });
    } catch (error) {
        next(error);
    }
};
