const Education = require("../models/Education");
const mongoose = require("mongoose");
const {generateLink, uploadFileEducation} = require('../services/DriveAPI');

exports.uploadEducationImage = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const education = await Education.findById(req.params.id);
        if (!education) return res.status(404).json({ message: "Education not found" });
        education.image = req.file.buffer;
        await education.save({ session });
        await session.commitTransaction();
        res.status(200).json({ message: "Image uploaded successfully" });
    }
    catch (err) {
        await session.abortTransaction();
        res.status(500).json( err.message );
    }
    finally {
        if (session) session.endSession();
    }
}

exports.createEducation = async (req, res) => {
    let session;
    const { title, content, synopsis, link } = req.body;
    if (!title || !content || !synopsis || !link) return res.status(400).json({ message: "Please fill all fields" });
    const newEducation = new Education({ title, content, synopsis, link });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        await newEducation.save({session});
        await session.commitTransaction();
        res.status(201).json({ message: "Education created successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
    }
}

exports.getAllEducation = async (req, res) => {
    try {
        const educations = await Education.find().sort({ date: -1 }).select("-__v -date -content");
        res.status(200).json(educations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getEducation = async (req, res) => {
    try {
        const education = await Education.findById(req.params.id).select("-__v -date -synopsis" );
        if (!education) return res.status(404).json({ message: "Education not found" });
        res.status(200).json(education);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateEducation = async (req, res) => {
    let session;
    const { title, content, synopsis } = req.body;
    if (!title || !content || !synopsis) return res.status(400).json({ message: "Please fill all fields" });
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const result = await Education.findByIdAndUpdate(req.params.id, { title, content, synopsis });
        if (!result) return res.status(404).json({ message: "Education not found" });
        await session.commitTransaction();
        res.status(200).json({ message: "Education updated successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
    }
}

exports.deleteEducation = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const result = await Education.findByIdAndDelete(req.params.id);
        if (!result) return res.status(400).json({ message: "Already deleted" });
        await session.commitTransaction();
        res.status(204).json({ message: "Education deleted successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    }
    finally {
        if (session) session.endSession();
    }
}