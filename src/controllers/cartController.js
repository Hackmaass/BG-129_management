const { getCartByUserId, products } = require('../data/store');

const DEFAULT_USER_ID = 'guest';

const resolveUserId = (req) => req.headers['x-user-id'] || DEFAULT_USER_ID;

const buildCartResponse = (cart) => {
    const items = cart.map((item) => ({
        ...item,
        lineTotal: Number((item.price * item.quantity).toFixed(2)),
    }));

    const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));

    return {
        items,
        subtotal,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    };
};

exports.getCart = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const cart = getCartByUserId(userId);

        res.status(200).json({
            status: 'success',
            data: buildCartResponse(cart),
        });
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const { productId, quantity = 1 } = req.body;

        const requestedProductId = Number(productId);
        const requestedQuantity = Number(quantity);

        if (!requestedProductId || !requestedQuantity || requestedQuantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid productId and quantity (>= 1) are required.',
            });
        }

        const product = products.find((item) => item.id === requestedProductId);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Product with id ${requestedProductId} not found.`,
            });
        }

        const cart = getCartByUserId(userId);
        const existingItem = cart.find((item) => item.productId === requestedProductId);
        const existingQuantity = existingItem ? existingItem.quantity : 0;

        if (existingQuantity + requestedQuantity > product.inventory) {
            return res.status(400).json({
                status: 'error',
                message: `Insufficient inventory for product ${product.name}.`,
            });
        }

        if (existingItem) {
            existingItem.quantity += requestedQuantity;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: requestedQuantity,
            });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Item added to cart.',
            data: buildCartResponse(cart),
        });
    } catch (error) {
        next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const productId = Number(req.params.productId);
        const cart = getCartByUserId(userId);

        const itemIndex = cart.findIndex((item) => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: `Product ${req.params.productId} is not in cart.`,
            });
        }

        cart.splice(itemIndex, 1);

        return res.status(200).json({
            status: 'success',
            message: `Product ${req.params.productId} removed from cart.`,
            data: buildCartResponse(cart),
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCartItem = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const productId = Number(req.params.productId);
        const quantity = Number(req.body.quantity);
        const cart = getCartByUserId(userId);

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'quantity must be >= 1.',
            });
        }

        const cartItem = cart.find((item) => item.productId === productId);
        if (!cartItem) {
            return res.status(404).json({
                status: 'error',
                message: `Product ${req.params.productId} is not in cart.`,
            });
        }

        const product = products.find((item) => item.id === productId);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Product with id ${req.params.productId} not found.`,
            });
        }

        if (quantity > product.inventory) {
            return res.status(400).json({
                status: 'error',
                message: `Requested quantity exceeds inventory for ${product.name}.`,
            });
        }

        cartItem.quantity = quantity;

        return res.status(200).json({
            status: 'success',
            message: 'Cart quantity updated.',
            data: buildCartResponse(cart),
        });
    } catch (error) {
        next(error);
    }
};
