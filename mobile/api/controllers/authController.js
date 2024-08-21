const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {convertDateToDayMonthYear} = require('../services/convertDatetoTanggal');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Please fill all fields" });
        //Mencari username
        const foundUser = await User.findOne ({ username });
        if (!foundUser) return res.status(404).json({ message: "User does not exist" });
        //Mengecek password
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });
        //Membuat token
        const token = jwt.sign(
            { 
                _id: foundUser._id,
                username: foundUser.username,
                role: foundUser.role
            }, 
            process.env.ACCESS_TOKEN_SECRET,
            { 
                expiresIn : "168h",
                issuer : process.env.TOKEN_ISSUER
            }
        );
        const expiredDate = convertDateToDayMonthYear(Date.now() + 168 * 60 * 60 * 1000);
        res.status(200).json({ 
            username : foundUser.username, 
            fullname: foundUser.fullname, 
            role: foundUser.role, 
            token, 
            expiredDate
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.validateToken = async (req, res) => {
    try {
        const token = req.header(process.env.TOKEN_HEADER);
        if (!token) return res.status(401).json({ message: "You are not logged in!" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
            if (err) return res.status(401).json({ message: "Invalid Token" });
            res.status(200).json({ message: "Valid Token" });
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}