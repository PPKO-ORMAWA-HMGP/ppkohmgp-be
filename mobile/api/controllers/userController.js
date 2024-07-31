const User = require('../models/User');
const BankSampah = require('../models/BankSampah');
const Notification = require('../models/Notification');
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
        if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
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

exports.updateUser = async (req,res) => {
    try {
        const { username, fullname, phoneNumber } = req.body;
        if (!username || !fullname || !phoneNumber) return res.status(400).json({ message: "Please fill all fields" });
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { username, fullname, phoneNumber}, { new: true });
        if (updatedUser) {
            const notification = new Notification({
                title: "Pengaturan Profil Berhasil",
                message: "Profil berhasil diperbaharui",
                date : Date.now() + 7*60*60*1000,
                type : "profile",
                user: new mongoose.Types.ObjectId(req.user.id)
            });
            await notification.save();
            return res.status(200).json(updatedUser);
        }
        else return res.status(404).json({ message: "User not found" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//Untuk liat nasabah dari daftar nasabah di sisi admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username fullname phoneNumber');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    }
    catch {
        res.status(500).json({ message: error.message });
    }
}