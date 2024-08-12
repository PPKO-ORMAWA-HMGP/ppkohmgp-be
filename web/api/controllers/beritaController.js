const Berita = require("../models/Berita");

exports.getAllBerita = async (req, res) => {
    try {
        const data = await Berita.find().sort({ date : 'desc' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
}