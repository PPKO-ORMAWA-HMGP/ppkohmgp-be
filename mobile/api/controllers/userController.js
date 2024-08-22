const User = require('../models/User');
const BankSampah = require('../models/BankSampah');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const validatePhoneNumber = (phoneNumber) => {
    if (typeof(phoneNumber) !== "string") return false;
    if (phoneNumber.length < 10 || phoneNumber.length >= 13) return false;
    if (phoneNumber[0] !== "0") return false;
    if (phoneNumber.match(/[^0-9]/)) return false;
    return true;
}

// dah bener
exports.registerUser = async (req, res) => {
    const { username, fullname, phoneNumber, password, bankSampah, role } = req.body;
    let session;
    //check
    if (!username || !fullname || !phoneNumber || !password || !bankSampah || !role) return res.status(400).json({ message: "Please fill all fields" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    validatePhoneNumber(phoneNumber);
    if (validatePhoneNumber(phoneNumber) === false) return res.status(400).json({ message: "Invalid phone number" });

    // kalo user sudah ada
    const user = await User.findOne({ phoneNumber });
    if (user) return res.status(400).json({ message: "User already exists" });
    // kalo bank sampah tidak ada
    const banksampah = await BankSampah.findOne({ name : bankSampah });
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, fullname, phoneNumber, password: hashedPassword, role , bankSampah: banksampah._id
        });
        await newUser.save({session});
        await BankSampah.findByIdAndUpdate(banksampah._id, { $push: { users: newUser._id } }, { session });
        await session.commitTransaction();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
    }
}

// untuk nampilin data di dashboard
// dah bener
exports.loadUser = async (req, res) => {
    try {
        if (req.user.role === "Anorganik") {
            const anorganikuser = {
                username: req.user.username,
                balance: req.user.balance
            }
            res.status(200).json(anorganikuser);
        }
        else if (req.user.role === "Organik") {
            const organikUser = {
                username: req.user.username,
                point: req.user.point
            }
            res.status(200).json(organikUser);
        }
        else return res.status(400).json({ message: "Invalid role" });
    }
    catch (error) {
            res.status(500).json({ message: error.message });
    }
}

//belum dicoba
exports.updateUser = async (req,res) => {
    let session;
    const { username, fullname, phoneNumber } = req.body;
    if (!username && !fullname && !phoneNumber) return res.status(400).json({ message: "Please provide at least one field to update" });
    const updateBody = {};
    if (username) updateBody.username = username;
    if (fullname) updateBody.fullname = fullname;
    if (phoneNumber) updateBody.phoneNumber = phoneNumber;
    validatePhoneNumber(phoneNumber);
    if (validatePhoneNumber(phoneNumber) === false) return res.status(400).json({ message: "Invalid phone number" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateBody, { new: true }, {session});
        if (updatedUser) {
            const notification = new Notification({
                title: "Pengaturan Profil Berhasil",
                message: "Profil berhasil diperbaharui",
                date : Date.now() + 7*60*60*1000,
                type : "profile",
                user: new mongoose.Types.ObjectId(req.user.id)
            });
            await notification.save({session});
            await session.commitTransaction();
            return res.status(200).json({ message: "User updated successfully" });
        }
        else return res.status(404).json({ message: "User not found" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
    }
}

//Untuk liat rekap nasabah dari daftar nasabah di sisi admin
// dah bener
exports.getUser = async (req, res) => {
    const role = req.user.role;
    if (role === "Admin-Anorganik") {
        try {
            const user = await User.findById(req.params.id)
                .populate({
                    path: 'anorganik',
                    select : 'description price date mass'
                })
                .select('fullname username -_id');
            user.anorganik.forEach(anorganik => {
                anorganik.price = anorganik.price * anorganik.mass;
            })
            const filteredAnorganik = user.anorganik.map(item => ({
                description: item.description,
                mass: item.mass,
                price: item.price
            }));
            const filteredUser = {
                fullname: user.fullname,
                username: user.username,
                anorganik: filteredAnorganik
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
    else if (role === "Admin-Organik") {
        try {
            const user = await User.findById(req.params.id)
                .populate({
                    path : 'organik',
                    select : 'kriteria',
                    match : { kriteria : 'Diterima' }
                })
                .select('fullname username -_id');
            const data = {
                fullname: user.fullname,
                username: user.username,
                totalanorganik : `${user.organik.length} kali`
            }
            res.status(200).json(data);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }  
    }
    else return res.status(400).json({ message: "Please provide valid type" });
}