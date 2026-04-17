const { products } = require('../data/store');

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

        const min = parseNumber(minPrice);
        const max = parseNumber(maxPrice);
        const loweredQuery = q ? q.toLowerCase() : '';

        let filtered = products.filter((product) => {
            const matchesQuery = !loweredQuery
                || product.name.toLowerCase().includes(loweredQuery)
                || product.description.toLowerCase().includes(loweredQuery);

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
        const id = Number(req.params.id);
        const product = products.find((item) => item.id === id);

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Product with id ${req.params.id} not found.`,
            });
        }

        return res.status(200).json({
            status: 'success',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = [...new Set(products.map((product) => product.category))].sort();

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
        const inventory = products.map((product) => ({
            id: product.id,
            name: product.name,
            inventory: product.inventory,
            inStock: product.inventory > 0,
        }));

        res.status(200).json({
            status: 'success',
            count: inventory.length,
            data: inventory,
        });
    } catch (error) {
        next(error);
    }
};
