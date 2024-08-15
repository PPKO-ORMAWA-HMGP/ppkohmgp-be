const Organik = require("../models/Organik");
const User = require("../models/User");
const BankSampah = require("../models/BankSampah");
const Notification = require("../models/Notification");
const { uploadFile, generateLink } = require("../services/DriveAPI");
const {convertDateToDayMonthYear} = require('../services/convertDatetoTanggal');

const mongoose = require("mongoose");
require("dotenv").config();

//dah bener
exports.createOrganik = async (req, res) => {
    let session;
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    const {files} = req;
    if (files.length === 0) return res.status(400).json({ message: "Please select at least one image!" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const tanggal = convertDateToDayMonthYear(Date.now() + 7 * 60 * 60 * 1000);
        const response = await uploadFile(tanggal, req.user.fullname, files[0]);
        const organik = new Organik({
            image : response.id,
            date: Date.now() + 7 * 60 * 60 * 1000,
            tanggal,
            user: new mongoose.Types.ObjectId(req.user.id)
        });
        await organik.save({session});
        await User.findByIdAndUpdate(req.user.id, { $push: { organik: organik._id } });
        await BankSampah.findByIdAndUpdate(banksampah._id, { $push: { organik: organik._id } });
        await session.commitTransaction();
        res.status(201).json({ message: "Organik created successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        session.endSession();
    }
}

//dah bener
exports.getLinkImage = async (req, res) => {
    const organik = await Organik.findById(req.params.id);
    if (!organik) return res.status(404).json({ message: "Organik not found" });
    const link = await generateLink(organik.image);
    res.status(200).json({link});
}

//dah bener
exports.verifyOrganik = async (req, res) => {
    let session;
    const {id} = req.params;
    const { feedback } = req.body;
    const organik = await Organik.findById(id);
    if (!organik) return res.status(404).json({ message: "Organik not found" });
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    if (organik.kriteria === "Diterima") return res.status(400).json({ message: "Organik already verified" });
    if (organik.kriteria === "Ditolak") return res.status(400).json({ message: "Organik already rejected" });

    if (!feedback) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            organik.kriteria = "Diterima";
            organik.price = "+1 Poin";
            await Organik.findByIdAndUpdate(req.params.id, { kriteria: "Diterima", price: "+1 Poin" });
            const notification = await Notification.create({
                title: "Sampah organik terkumpul",
                message: "Poin organik berhasil didapatkan",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            await User.findByIdAndUpdate(organik.user, { $inc: { point: 1 }, $push: { notification: notification._id } });
            await session.commitTransaction();
            res.status(200).json({ message: "Organik verified successfully" });
        }
        catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        }
        finally {
            session.endSession();
        }
    }
    else {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            organik.kriteria = "Ditolak";
            organik.feedback = feedback;
            await Organik.findByIdAndUpdate(req.params.id, { kriteria: "Ditolak", feedback });
            const notification = await Notification.create({
                title: "Sampah organik gagal terkumpul",
                message: "Sampah tidak memenuhi kriteria organik",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            await User.findByIdAndUpdate(organik.user, { $push: { notification: notification._id } });
            await session.commitTransaction();
            res.status(200).json({ message: "Organik verified successfully" });
        }
        catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        }
        finally {
            session.endSession();
        }
    }
}

//untuk nampilin riwayat di page riwayat dan dashboard user
//dah bener
exports.riwayatOrganik = async (req, res) => {
    try {
        const organiks = await Organik.find({user: req.user._id, kriteria: "Diterima"})
        .select('date tanggal kriteria type price')
        .sort({date: -1});
        if (organiks.length === 0) return res.status(204).json({ message: "No organik found" });
        organiks.forEach(organik => {
            organik.type = "Tambah Poin";
            organik.price = "+1 Poin";
            organik.tanggal = convertDateToDayMonthYear(organik.date);
        });
        res.status(200).json(organiks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}