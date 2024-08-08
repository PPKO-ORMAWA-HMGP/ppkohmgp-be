const Organik = require("../models/Organik");
const User = require("../models/User");
const BankSampah = require("../models/BankSampah");
const Notification = require("../models/Notification");

const mongoose = require("mongoose");
const moment = require("moment");
require("dotenv").config();

exports.createOrganik = async (req, res) => {
    let session;
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    const { image } = req.body
    if (!image) return res.status(400).json({ message: "Please select at least one image!" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const organik = new Organik({
            image,
            date: Date.now() + 7 * 60 * 60 * 1000,
            user: new mongoose.Types.ObjectId(req.user.id)
        });
        await organik.save();
        await User.findByIdAndUpdate(req.user.id, { $push: { organik: organik._id, notification: notification._id } });
        await BankSampah.findByIdAndUpdate(banksampah._id, { $push: { organik: organik._id } });
        await session.commitTransaction();
        res.status(201).json({ message: "Organik created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    finally {
        session.endSession();
    }
}

exports.verifyOrganik = async (req, res) => {
    let session;
    const organik = await Organik.findById(req.params.id);
    if (!organik) return res.status(404).json({ message: "Organik not found" });
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    if(organik.kriteria === "Diterima") return res.status(400).json({ message: "Organik already verified" });

    const {kriteria, feedback} = req.body;
    if (!kriteria) return res.status(400).json({ message: "Please fill all fields" });
    if (kriteria !== "Diterima" && kriteria !== "Ditolak") return res.status(400).json({ message: "Invalid criteria" });
    if (kriteria === "Ditolak" && !feedback) return res.status(400).json({ message: "Please fill feedback" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        await Organik.findByIdAndUpdate(req.params.id, { kriteria, feedback });
        if (kriteria === "Diterima") {
            const user = await User.findById(organik.user);
            if (!user) return res.status(404).json({ message: "User not found" });
            const notification = new Notification({
                title: "Sampah organik terkumpul",
                message: "Poin organik berhasil didapatkan",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            await notification.save();
            await User.findByIdAndUpdate(organik.user, { $push: { notification: notification._id } });
            await BankSampah.findByIdAndUpdate(banksampah._id, { $push: { organik: organik._id } });
            user.point += 1;
            await user.save();
        }
        await session.commitTransaction();
        res.status(200).json({ message: "Organik verified successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    finally {
        session.endSession();
    }
}

exports.riwayatOrganik = async (req, res) => {
    try {
        const organiks = await Organik.find({ user: req.user.id })
            .select("kriteria -__v")
            .sort({ date: -1 });
        organiks.forEach(organik => {
            organik.kriteria = "Tambah Poin";
            const formattedDate = moment.utc(anorganik.date).format('DD MMMM YYYY');
            const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
            organik.tanggal = indonesianDate
            organik.price = "+ 1 Poin";
        });
        res.status(200).json(organik);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}