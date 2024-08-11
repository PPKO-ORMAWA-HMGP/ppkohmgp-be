const Organik = require("../models/Organik");
const User = require("../models/User");
const BankSampah = require("../models/BankSampah");
const Notification = require("../models/Notification");
const { uploadFile, generateLink } = require("../services/DriveAPI");
const {convertDatetoDayMonthYear} = require('../services/convertDatetoTanggal');

const mongoose = require("mongoose");
require("dotenv").config();

exports.createOrganik = async (req, res) => {
    let session;
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    const [image] = req.files;
    if (!image) return res.status(400).json({ message: "Please select at least one image!" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const response = await uploadFile(tanggal, req.user.fullname, image);
        const tanggal = convertDatetoDayMonthYear(Date.now() + 7 * 60 * 60 * 1000);
        const organik = new Organik({
            image : response.id,
            date: Date.now() + 7 * 60 * 60 * 1000,
            tanggal,
            user: new mongoose.Types.ObjectId(req.user.id)
        });
        await organik.save(session);
        await User.findByIdAndUpdate(req.user.id, { $push: { organik: organik._id } });
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

exports.getLinkImage = async (req, res) => {
    const organik = await Organik.findById(req.params.id);
    if (!organik) return res.status(404).json({ message: "Organik not found" });
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    res.status(200).json({ link: generateLink(organik.image) });
}

exports.verifyOrganik = async (req, res) => {
    let session;
    const organik = await Organik.findById(req.params.id);
    if (!organik) return res.status(404).json({ message: "Organik not found" });
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    if(organik.kriteria === "Diterima") return res.status(400).json({ message: "Organik already verified" });

    const { feedback } = req.body;
    if (!feedback) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            organik.kriteria = "Diterima";
            organik.price = "+ 1 Poin";
            await Organik.findByIdAndUpdate(req.params.id, { kriteria: "Diterima", price: "+ 1 Poin" });
            await Notification.create({
                title: "Sampah organik terkumpul",
                message: "Poin organik berhasil didapatkan",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            await User.findByIdAndUpdate(organik.user, { $inc: { point: 1 }, $push: { notification: notification._id } });
            session.commitTransaction();
            res.status(200).json({ message: "Organik verified successfully" });
        }
        catch (error) {
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
            await Notification.create({
                title: "Sampah organik gagal terkumpul",
                message: "Sampah tidak memenuhi kriteria organik",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            await User.findByIdAndUpdate(organik.user, { $push: { notification: notification._id } });
            session.commitTransaction();
            res.status(200).json({ message: "Organik verified successfully" });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
        finally {
            session.endSession();
        }
    }
}

exports.riwayatOrganik = async (req, res) => {
    try {
        const organiks = await Organik.find({ user: req.user.id })
            .select("kriteria -__v")
            .sort({ date: -1 });
        organiks.forEach(organik => {
            organik.kriteria = "Tambah Poin";
            organik.tanggal = convertDatetoDayMonthYear(organik.date);
            organik.price = "+ 1 Poin";
        });
        res.status(200).json(organik);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}