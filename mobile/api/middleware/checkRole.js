const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const verifyToken = async (req, res, next, roles) => {
    try {
        const token = req.header(process.env.TOKEN_HEADER);
        if (!token) {
            return res.status(401).json({ message: "You are not logged in!" });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { issuer: process.env.TOKEN_ISSUER }, async (err, user) => {
            if (err) {
                return res.status(401).json({ message: "Invalid Token" });
            }

            const query = { _id: user._id };
            if (roles) {
                query.role = { $in: roles };
            }

            req.user = await User.findOne(query).select("-password -phoneNumber");
            if (!req.user) {
                return res.status(403).json({ message: "Forbidden" });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.protectAdmin = (req, res, next) => {
    verifyToken(req, res, next, ["Admin-Organik", "Admin-Anorganik"]);
};

exports.protectAdminOrganik = (req, res, next) => {
    verifyToken(req, res, next, ["Admin-Organik"]);
};

exports.protectAdminAnorganik = (req, res, next) => {
    verifyToken(req, res, next, ["Admin-Anorganik"]);
};

exports.protectOrganik = (req, res, next) => {
    verifyToken(req, res, next, ["Organik"]);
};

exports.protectAnorganik = (req, res, next) => {
    verifyToken(req, res, next, ["Anorganik"]);
};

exports.protectClient = (req, res, next) => {
    verifyToken(req, res, next, ["Organik", "Anorganik"]);
};

exports.protectNotification = (req, res, next) => {
    verifyToken(req, res, next);
};
