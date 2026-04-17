const {
    getCartByUserId,
    products,
    orders,
    generateOrderId,
} = require('../data/store');

const DEFAULT_USER_ID = 'guest';
const SHIPPING_FEE = 9.99;

const resolveUserId = (req) => req.headers['x-user-id'] || DEFAULT_USER_ID;

const calculateSubtotal = (items) => Number(
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
);

const fakePaymentGatewayCharge = ({ paymentMethod, amount }) => {
    const supportedMethods = ['card', 'upi', 'wallet', 'cod'];
    const normalizedMethod = String(paymentMethod || '').toLowerCase();

    if (!supportedMethods.includes(normalizedMethod)) {
        return {
            success: false,
            reason: `Unsupported payment method. Use one of: ${supportedMethods.join(', ')}`,
        };
    }

    if (amount <= 0) {
        return {
            success: false,
            reason: 'Invalid payment amount.',
        };
    }

    return {
        success: true,
        transactionId: `TXN-${Date.now()}`,
    };
};

exports.checkout = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const { shippingAddress, paymentMethod = 'card' } = req.body;
        const cart = getCartByUserId(userId);

        if (!shippingAddress) {
            return res.status(400).json({
                status: 'error',
                message: 'shippingAddress is required.',
            });
        }

        if (cart.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cart is empty.',
            });
        }

        for (const cartItem of cart) {
            const product = products.find((item) => item.id === cartItem.productId);

            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: `Product ${cartItem.productId} no longer exists.`,
                });
            }

            if (cartItem.quantity > product.inventory) {
                return res.status(400).json({
                    status: 'error',
                    message: `Insufficient inventory for ${product.name}.`,
                });
            }
        }

        const subtotal = calculateSubtotal(cart);
        const total = Number((subtotal + SHIPPING_FEE).toFixed(2));
        const paymentResult = fakePaymentGatewayCharge({ paymentMethod, amount: total });

        if (!paymentResult.success) {
            return res.status(400).json({
                status: 'error',
                message: paymentResult.reason,
            });
        }

        for (const cartItem of cart) {
            const product = products.find((item) => item.id === cartItem.productId);
            product.inventory -= cartItem.quantity;
        }

        const order = {
            orderId: generateOrderId(),
            userId,
            status: 'placed',
            items: cart.map((item) => ({ ...item })),
            shippingAddress,
            paymentMethod,
            paymentTransactionId: paymentResult.transactionId,
            subtotal,
            shippingFee: SHIPPING_FEE,
            total,
            createdAt: new Date().toISOString(),
        };

        orders.push(order);
        cart.length = 0;

        return res.status(201).json({
            status: 'success',
            message: 'Order placed successfully.',
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderHistory = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const userOrders = orders
            .filter((order) => order.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            status: 'success',
            count: userOrders.length,
            data: userOrders,
        });
    } catch (error) {
        next(error);
    }
};
