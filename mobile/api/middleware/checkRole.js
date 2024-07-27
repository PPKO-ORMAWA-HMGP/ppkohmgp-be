const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.protectAdmin = async (req, res, next) => {
    try {
        const token = req.header(process.env.TOKEN_HEADER);
        if (!token) return res.status(401).json({ message: "Access Denied" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { issuer : process.env.TOKEN_ISSUER }, async (err, user) => {
            if (err) return res.status(401).json({ message: "Invalid Token" });
            req.user = await User.findOne({
                $or:[{
                    $and: [{
                            _id: user._id
                        },
                        {
                            role: "Admin-Organik"
                        }]
                    }, 
                    {$and: [{
                            _id: user._id
                        }, 
                        {
                            role: "Admin-Anorganik"
                        }]
                    }]
                });
            if (!req.user) return res.status(401).json({ message: "Access Denied" });
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.protectAdminOrganik = async (req, res, next) => {
    try {
        const token = req.header(process.env.TOKEN_HEADER);
        if (!token) return res.status(401).json({ message: "Access Denied" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { issuer : process.env.TOKEN_ISSUER }, async (err, user) => {
            if (err) return res.status(401).json({ message: "Invalid Token" });
            req.user = await User.findOne({$and: [{_id: user._id}, {role: "Admin-Organik"}]});
            if (!req.user) return res.status(401).json({ message: "Access Denied" });
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.protectAdminAnorganik = async (req, res, next) => {
    try {
        const token = req.header(process.env.TOKEN_HEADER);
        if (!token) return res.status(401).json({ message: "Access Denied" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(401).json({ message: "Invalid Token" });
            req.user = await User.findOne({$and: [{_id: user._id}, {role: "Admin-Anorganik"}]});
            if (!req.user) return res.status(401).json({ message: "Access Denied" });
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.protectClient = async (req, res, next) => {
    try {
        const token = req.header(process.env.TOKEN_HEADER);
        if (!token) return res.status(401).json({ message: "Access Denied" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(401).json({ message: "Invalid Token" });
            req.user = await User.findOne({$and: [{_id: user._id}, {role: "Client"}]});
            if (!req.user) return res.status(401).json({ message: "Access Denied" });
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}