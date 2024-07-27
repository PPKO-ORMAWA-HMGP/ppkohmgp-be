const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
    try {
        const { username, fullname, phoneNumber, password } = req.body;
        // kalo ada field yang kosong
        if (!username || !fullname || !phoneNumber || !password) return res.status(400).json({ message: "Please fill all fields" });
        const user = await User.findOne({ phoneNumber });
        // kalo user sudah ada
        if (user) return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, fullname, phoneNumber, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const {location} = req.params;
        const users = await User.find({role : "Client"});

    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}