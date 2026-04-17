const { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = require('../config/firebaseAdmin');
const { runAutomationEngine } = require('../services/automationEngine');

const parseNumber = (value) => {
    if (value === undefined) {
        return undefined;
    }
    const converted = Number(value);
    return Number.isNaN(converted) ? undefined : converted;
};

exports.getAllProducts = async (req, res, next) => {
    try {
        const {
            q,
            category,
            minPrice,
            maxPrice,
            featured,
            inStock,
            sortBy = 'name',
            sortOrder = 'asc',
        } = req.query;

        // Fetch all products from Firestore
        const productsSnapshot = await getDocs(collection(db, 'products'));
        let products = [];
        productsSnapshot.forEach(docSnap => {
            products.push({ id: docSnap.id, ...docSnap.data() });
        });

        const min = parseNumber(minPrice);
        const max = parseNumber(maxPrice);
        const loweredQuery = q ? q.toLowerCase() : '';

        // Client-side filtering (Firestore compound queries can be complex, doing it in memory for now)
        let filtered = products.filter((product) => {
            const title = (product.title || product.name || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();
            const matchesQuery = !loweredQuery
                || title.includes(loweredQuery)
                || desc.includes(loweredQuery);

            const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
            const matchesMin = min === undefined || product.price >= min;
            const matchesMax = max === undefined || product.price <= max;
            const matchesFeatured = featured === undefined || String(product.featured) === String(featured);
            const matchesInStock = inStock === undefined
                || (String(inStock) === 'true' ? product.inventory > 0 : product.inventory === 0);

            return matchesQuery && matchesCategory && matchesMin && matchesMax && matchesFeatured && matchesInStock;
        });

        const allowedSortFields = ['name', 'price', 'rating', 'inventory', 'category'];
        const resolvedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const direction = sortOrder === 'desc' ? -1 : 1;

        filtered = filtered.sort((a, b) => {
            if (typeof a[resolvedSortBy] === 'string') {
                return a[resolvedSortBy].localeCompare(b[resolvedSortBy]) * direction;
            }
            return (a[resolvedSortBy] - b[resolvedSortBy]) * direction;
        });

        res.status(200).json({
            status: 'success',
            count: filtered.length,
            data: filtered,
        });
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({
                status: 'error',
                message: `Product with id ${id} not found.`,
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { id: docSnap.id, ...docSnap.data() },
        });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = [];
        productsSnapshot.forEach(docSnap => products.push(docSnap.data()));
        
        const categories = [...new Set(products.map((product) => product.category))].filter(Boolean).sort();

        res.status(200).json({
            status: 'success',
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

exports.getInventory = async (req, res, next) => {
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const inventory = [];
        
        productsSnapshot.forEach(docSnap => {
            const product = docSnap.data();
            inventory.push({
                id: docSnap.id,
                name: product.name,
                inventory: product.inventory,
                inStock: product.inventory > 0,
            });
        });

        res.status(200).json({
            status: 'success',
            count: inventory.length,
            data: inventory,
        });
    } catch (error) {
        next(error);
    }
};
exports.createProduct = async (req, res, next) => {
    try {
        const { title, price, inventory, category, description, image, type, techStackTags } = req.body;
        
        const newDocRef = doc(collection(db, 'products'));
        const productData = {
            id: newDocRef.id,
            title,
            price: Number(price),
            inventory: Number(inventory),
            category: category || 'general',
            description: description || '',
            image: image || 'assets/images/hoodie.png',
            type: type || 'physical',
            techStackTags: techStackTags || [],
            rating: 5.0,
            featured: false,
            createdAt: new Date().toISOString()
        };

        await setDoc(newDocRef, productData);
        
        // Trigger Automation: new_product
        runAutomationEngine('new_product', productData).catch(err => console.error(err));

        res.status(201).json({ status: 'success', data: productData });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Clean and validate updates
        if (updates.price) updates.price = Number(updates.price);
        if (updates.inventory) updates.inventory = Number(updates.inventory);

        const docRef = doc(db, 'products', id);
        const oldDocSnap = await getDoc(docRef);
        const oldProduct = oldDocSnap.exists() ? oldDocSnap.data() : null;

        await updateDoc(docRef, updates);
        
        // Fetch new state for triggers
        const newDocSnap = await getDoc(docRef);
        const newProduct = { id, ...newDocSnap.data() };

        if (oldProduct) {
            // Price Drop Trigger
            if (newProduct.price < oldProduct.price) {
                runAutomationEngine('price_drop', newProduct).catch(err => console.error(err));
            }
            // Restock Trigger
            if (oldProduct.inventory === 0 && newProduct.inventory > 0) {
                runAutomationEngine('restock', newProduct).catch(err => console.error(err));
            }
        }

        res.status(200).json({ status: 'success', message: `Product ${id} updated.` });
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const docRef = doc(db, 'products', id);
        await deleteDoc(docRef);
        res.status(200).json({ status: 'success', message: `Product ${id} deleted.` });
    } catch (error) {
        next(error);
    }
};
