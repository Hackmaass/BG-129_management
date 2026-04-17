const pool = require('../config/db');

exports.register = async (req, res, next) => {
    try {
        // const { name, email, password } = req.body;
        // Hash password, insert into 'users' table
        res.status(201).json({ message: 'Register endpoint opening' });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        // Validate user against 'users' table, return JWT
        res.status(200).json({ message: 'Login endpoint opening' });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        res.status(200).json({ message: 'Get Me endpoint opening' });
    } catch (error) {
        next(error);
    }
};
