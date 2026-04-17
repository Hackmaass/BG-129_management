const pool = require('../config/db');

exports.getAllProducts = async (req, res, next) => {
    try {
        // Query 'products' table
        res.status(200).json({ message: 'Get All Products endpoint opening' });
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Query 'products' table where id = id
        res.status(200).json({ message: `Get Product by ID ${id} endpoint opening` });
    } catch (error) {
        next(error);
    }
};
