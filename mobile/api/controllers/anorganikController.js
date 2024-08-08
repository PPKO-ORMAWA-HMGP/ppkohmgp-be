const Anorganik = require('../models/Anorganik');
const User = require('../models/User');
const Notification = require('../models/Notification');
const BankSampah = require('../models/BankSampah');

const mongoose = require('mongoose');
const moment = require('moment');

exports.createAnorganik = async (req, res) => {
    let session;
    // Cek User
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Cek Role
    if (user.role !== "Anorganik") return res.status(400).json({ message: "User is not Anorganik" });
    // Cek Bank Sampah
    const bankSampah = await BankSampah.findById(req.user.bankSampah);
    if (user.bankSampah.toString() !== bankSampah._id.toString()) return res.status(400).json({ message: "User is not registered to this Bank Sampah" });
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
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        // Cek Anorganik masuk ga
        const newAnorganik = await Anorganik.insertMany(buffer);
        if (!newAnorganik) return res.status(400).json({ message: "Anorganik not created" });

        //loop untuk masukin notifikasi dan user ke db
        for (let i = 0; i < newAnorganik.length; i++) {
            const notification = new Notification({
                title: "Sampah anorganik terkumpul",
                message:`Saldo Anorganik anda bertambah sebesar Rp. + ${newAnorganik[i].price * newAnorganik[i].mass}`,
                date : Date.now() + 7*60*60*1000,
                type : "add",
                user: new mongoose.Types.ObjectId(req.params.id)
            });
            await notification.save();
            await BankSampah.findByIdAndUpdate(bankSampah._id, { $push: { anorganik: newAnorganik[i]._id } });
            user.anorganik.push(newAnorganik[i]._id);
            user.notification.push(notification._id);
            user.balance += (newAnorganik[i].price * newAnorganik[i].mass);
            await user.save();
        };
        await session.commitTransaction();
        res.status(201).json({ message: "Anorganik created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Tambah Saldo Kurang Saldo (done)
// Organik Tambah Poin Tukar Poin
exports.riwayatAnorganik = async (req, res) => {
    try {
        const anorganiks = await Anorganik.find({user : req.user.id})
            .select('-description -user -__v -_id')
            .sort({ date : -1 });
        anorganiks.forEach(anorganik => {
            anorganik.type = "Tambah Saldo";
            anorganik.price = anorganik.price * anorganik.mass;
            const formattedDate = moment.utc(anorganik.date).format('DD MMMM YYYY');
            const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
            anorganik.tanggal = indonesianDate;
        })
        
        res.status(200).json(anorganiks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
    }
}