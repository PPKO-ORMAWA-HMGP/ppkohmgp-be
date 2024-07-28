const User = require('../models/User');
const BankSampah = require('../models/BankSampah');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
    try {
        const { username, fullname, phoneNumber, password, bankSampah, role } = req.body;
        // kalo ada field yang kosong
        if (!username || !fullname || !phoneNumber || !password || !bankSampah || !role) return res.status(400).json({ message: "Please fill all fields" });
        const user = await User.findOne({ phoneNumber });
        const banksampah = await BankSampah.findOne({ name : bankSampah });
        // kalo user sudah ada
        if (user) return res.status(400).json({ message: "User already exists" });
        // kalo bank sampah tidak ada
        if (!banksampah) return res.status(400).json({ message: "Bank Sampah not found" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, fullname, phoneNumber, password: hashedPassword, role , bankSampah: banksampah._id
        });
        await newUser.save();
        await BankSampah.findByIdAndUpdate(banksampah._id, { $push: { users: newUser._id } });
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}