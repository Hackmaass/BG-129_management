const pool = require('../config/db');

exports.checkout = async (req, res, next) => {
    try {
        // Convert cart_items to an order in 'orders' and 'order_items' tables
        res.status(201).json({ message: 'Checkout endpoint opening' });
    } catch (error) {
        next(error);
    }
};

exports.getOrderHistory = async (req, res, next) => {
    try {
        // Query 'orders' for logged-in user
        res.status(200).json({ message: 'Get Order History endpoint opening' });
    } catch (error) {
        next(error);
    }
};
