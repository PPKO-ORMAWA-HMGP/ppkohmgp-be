const User = require('../models/User');
const BankSampah = require('../models/BankSampah');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.registerUser = async (req, res) => {
    try {
        const { username, fullname, phoneNumber, password, bankSampah, role } = req.body;
        
        //check
        if (!username || !fullname || !phoneNumber || !password || !bankSampah || !role) return res.status(400).json({ message: "Please fill all fields" });
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
        if (typeof(phoneNumber) !== "string") return res.status(400).json({ message: "Phone number must be a string" });
        if (phoneNumber.length < 10 || phoneNumber.length >= 13) return res.status(400).json({ message: "Phone number must be between 10 and 13 characters" });
        if (phoneNumber[0] !== "0") return res.status(400).json({ message: "Phone number must start with 0" });
        if (phoneNumber.match(/[^0-9]/)) return res.status(400).json({ message: "Phone number must contain only numbers" });

        // kalo user sudah ada
        const user = await User.findOne({ phoneNumber });
        if (user) return res.status(400).json({ message: "User already exists" });
        // kalo bank sampah tidak ada
        const banksampah = await BankSampah.findOne({ name : bankSampah });
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

// butuh riwayat anorganik dan organik
exports.loadUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        .populate({
                path : 'organik',
            })
        .select('username balance point -_id')
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
}

exports.updateUser = async (req,res) => {
    try {
        const { username, fullname, phoneNumber } = req.body;
        if (!username || !fullname || !phoneNumber) return res.status(400).json({ message: "Please fill all fields" });
        if (typeof(phoneNumber) !== "string") return res.status(400).json({ message: "Phone number must be a string" });
        if (phoneNumber.length < 10 || phoneNumber.length >= 13) return res.status(400).json({ message: "Phone number must be between 10 and 13 characters" });
        if (phoneNumber[0] !== "0") return res.status(400).json({ message: "Phone number must start with 0" });
        if (phoneNumber.match(/[^0-9]/)) return res.status(400).json({ message: "Phone number must contain only numbers" });
        const updatedUser = await User.findByIdAndUpdate(req.user._id, { username, fullname, phoneNumber}, { new: true });
        if (updatedUser) {
            const notification = new Notification({
                title: "Pengaturan Profil Berhasil",
                message: "Profil berhasil diperbaharui",
                date : Date.now() + 7*60*60*1000,
                type : "profile",
                user: new mongoose.Types.ObjectId(req.user.id)
            });
            await notification.save();
            return res.status(200).json({ message: "User updated successfully" });
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
        const user = await User.findById(req.params.id)
            .populate({
                path: 'anorganik',
                select : 'description price date mass'
            })
            .select('fullname phoneNumber username -_id');
        const filteredUser = {
            fullname: user.fullname,
            phoneNumber: user.phoneNumber,
            username: user.username,
            anorganik: user.anorganik
        }
        let totalAnorganikMass = 0;
        for (i = 0; i < user.anorganik.length; i++) {
            totalAnorganikMass += user.anorganik[i].mass;
        }
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({...filteredUser,"totalanorganik": `${user.anorganik.length} kali`, "massanorganik": `${totalAnorganikMass} kg`});
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}