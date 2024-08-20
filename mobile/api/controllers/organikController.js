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
        await User.findByIdAndUpdate(req.user.id, { $push: { organik: organik._id } }, { session });
        await BankSampah.findByIdAndUpdate(banksampah._id, { $push: { organik: organik._id } }, { session });
        const admin = await User.findOne({role : "Admin-Organik", bankSampah : banksampah._id}).select('_id');
        const adminNotification = new Notification({
            title: "Verifikasi Organik",
            message: "Permintaan Organik menunggu verifikasi",
            date: Date.now() + 7 * 60 * 60 * 1000,
            type: "add",
            user: admin._id
        });
        await adminNotification.save({session});
        await User.findByIdAndUpdate(admin._id, { $push: { notification: adminNotification._id } }, { session });
        await session.commitTransaction();
        res.status(201).json({ message: "Organik created successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
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
    const { id } = req.params;
    const { feedback } = req.body;
    const organik = await Organik.findById(id);
    if (!organik) return res.status(404).json({ message: "Organik not found" });
    const banksampah = await BankSampah.findById(req.user.bankSampah);
    if (!banksampah) return res.status(404).json({ message: "Bank Sampah not found" });
    if (organik.kriteria !== "Menunggu") return res.status(400).json({ message: "Organik has been verified" });

    if (!feedback) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            await Organik.findByIdAndUpdate(req.params.id, { kriteria: "Diterima", poin : 1 }, { session });
            const userNotification = new Notification ({
                title: "Sampah organik terkumpul",
                message: "Poin organik berhasil didapatkan",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            const adminNotification = new Notification({
                title: "Verifikasi Organik",
                message: "Organik berhasil diverifikasi",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "add",
                user: new mongoose.Types.ObjectId(req.user.id)
            });
            await userNotification.save({session});
            await adminNotification.save({session});
            await User.findByIdAndUpdate(req.user.id, { $push: { notification: adminNotification._id } }, { session });
            await User.findByIdAndUpdate(organik.user, { $inc: { point: 1 }, $push: { notification: userNotification._id } }, { session });
            await session.commitTransaction();
            res.status(200).json({ message: "Organik verified successfully" });
        }
        catch (error) {
            await session.abortTransaction();
            res.status(500).json({ message: error.message });
        }
        finally {
            if (session) session.endSession();
        }
    }
    else {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            await Organik.findByIdAndUpdate(req.params.id, { kriteria: "Ditolak", feedback }, { session });
            const notification = new Notification({
                title: "Sampah organik gagal terkumpul",
                message: "Sampah tidak memenuhi kriteria organik",
                date: Date.now() + 7 * 60 * 60 * 1000,
                type: "gagal",
                user: new mongoose.Types.ObjectId(organik.user)
            });
            await notification.save({session});
            await User.findByIdAndUpdate(organik.user, { $push: { notification: notification._id } }, { session });
            await session.commitTransaction();
            res.status(200).json({ message: "Organik verified successfully" });
        }
        catch (error) {
            await session.abortTransaction();
            res.status(500).json(error.message);
        }
        finally {
            if (session) session.endSession();
        }
    }
}

//untuk nampilin riwayat di page riwayat dan dashboard user
//dah bener
exports.riwayatOrganik = async (req, res) => {
    try {
        const organiks = await Organik.find({
            user: req.user._id,
            $or : [{kriteria : "Diterima"}, {kriteria : "Ditukar"}]
            })
            .select('poin date tanggal kriteria type')
            .sort({date: -1})
        if (organiks.length === 0) return res.status(204).json({ message: "User ini belum mengumpulkan organik" });
        organiks.forEach(organik => {
            if (organik.kriteria === "Diterima") organik.type = "Tambah Poin";
            else organik.type = "Tukar Poin";
        });
        res.status(200).json(organiks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.tukarPoin = async (req, res) => {
    let session;
    const {id} = req.query;
    const {poin} = req.body;
    //check user
    const user = await User.findById(id).select('-password -__v -notification -phoneNumber');
    if (!user || user.role !== "Organik" || user.bankSampah.toString() !== req.user.bankSampah.toString()) 
        return res.status(404).json({ message: "User not found" });
    if (user.point < poin) return res.status(400).json({ message: "Insufficient point" });
    if (poin < 1) return res.status(400).json({ message: "Minimum point is 1" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        user.point -= poin;
        const organik = new Organik({
            date: Date.now() + 7 * 60 * 60 * 1000,
            tanggal: convertDateToDayMonthYear(Date.now() + 7 * 60 * 60 * 1000),
            poin : -poin,
            kriteria: "Ditukar",
            user: user._id
        });
        await organik.save({session});
        const userNotification = new Notification({
            title: "Penukaran poin organik",
            message: "Poin organik berhasil ditukarkan dengan barang",
            date: Date.now() + 7 * 60 * 60 * 1000,
            type: "penukaran",
            user: new mongoose.Types.ObjectId(id)
        });
        await userNotification.save({session});
        await User.findByIdAndUpdate(id, { point: user.point, $push: {notification : userNotification._id}}, { session });
        const adminNotification = new Notification({
            title: "Penukaran poin organik",
            message: `User ${user.username} telah menukar poin organik sebesar ${poin}`,
            date: Date.now() + 7 * 60 * 60 * 1000,
            type: "penukaran",
            user: req.user.id
        }); 
        await adminNotification.save({session});
        await User.findByIdAndUpdate(req.user.id, { $push: { notification: adminNotification._id } }, { session });
        await session.commitTransaction();
        res.status(200).json({ message: "Point exchanged successfully" });
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json(err.message);
    }
    finally {
        if (session) session.endSession();
    }
}