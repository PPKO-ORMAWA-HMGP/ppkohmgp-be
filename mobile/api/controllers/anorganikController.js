const Anorganik = require('../models/Anorganik');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const BankSampah = require('../models/BankSampah');
const moment = require('moment');

exports.createAnorganik = async (req, res) => {
    try {
        // Cek User
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        // Cek Bank Sampah
        const bankSampah = await BankSampah.findById(user.bankSampah);
        if (!bankSampah) return res.status(404).json({ message: "Bank Sampah not found" });
        const buffer = []; // untuk nampung data sampah anorganik

        //loop untuk nyimpen data anorganik ke variabel buffer
        for (let i = 0; i < req.body.length; i++) {
            if (!req.body[i].type || !req.body[i].description) return res.status(400).json({ message: "Please fill all fields" });
            if (req.body[i].price <= 0 || req.body[i].mass <= 0) return res.status(400).json({ message: "Price or mass must be positive" });
            const anorganik = new Anorganik({
                type: req.body[i].type,
                description: req.body[i].description,
                mass: req.body[i].mass,
                price: req.body[i].price,
                date : Date.now() + 7*60*60*1000,
                user: new mongoose.Types.ObjectId(req.params.id)
            });
            buffer.push(anorganik)
        };
        
        // Cek Anorganik masuk ga
        const newAnorganik = await Anorganik.insertMany(buffer);
        if (!newAnorganik) return res.status(400).json({ message: "Anorganik not created" });

        //loop untuk masukin notifikasi dan user ke db
        for (let i = 0; i < newAnorganik.length; i++) {
            const notification = new Notification({
                title: "Penambahan Saldo Anorganik",
                message: "Saldo Anorganik anda bertambah sebesar Rp." + newAnorganik[i].price,
                date : Date.now() + 7*60*60*1000,
                type : "add",
                user: new mongoose.Types.ObjectId(req.params.id)
            });
            await notification.save();
            await BankSampah.findByIdAndUpdate(bankSampah._id, { $push: { anorganik: newAnorganik[i]._id } });
            user.anorganik.push(newAnorganik[i]._id);
            user.notification.push(notification._id);
            await user.save();
        };

        res.status(201).json({ message: "Anorganik created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.riwayatAnorganik = async (req, res) => {
    try {
        const users = await User.findById(req.user.id)
            .populate({
                path : 'anorganik',
                select : 'type price date -_id',
            }
            );
        if (!users) return res.status(404).json({ message: "User not found" });
        users.anorganik.forEach(user => {
            const formattedDate = moment.utc(user.date).format('DD MMMM YYYY');
            const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
            user.tanggal = indonesianDate;
        })
        
        res.status(200).json(users.anorganik);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
