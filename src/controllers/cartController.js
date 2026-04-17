const pool = require('../config/db');

exports.getCart = async (req, res, next) => {
    try {
        // Query 'cart_items' table for logged-in user
        res.status(200).json({ message: 'Get Cart endpoint opening' });
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        // Insert into 'cart_items' table
        res.status(201).json({ message: 'Add to Cart endpoint opening' });
    } catch (error) {
        next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        // Delete from 'cart_items' table
        res.status(200).json({ message: `Remove Product ${productId} from Cart endpoint opening` });
    } catch (error) {
        next(error);
    }
};
