const BankSampah = require('../models/BankSampah');
const {
    getAllUserAnorganikAggregate,
    getAllUserOrganikAggregate,
    getDaftarNasabahAggregate
} = require('../utils/banksampahAggregate')

//untuk daftar nasabah
// dah bener
exports.getDaftarNasabah = async (req, res) => {
    let role = req.user.role;
    if (role === 'Admin-Organik') role = 'Organik';
    if (role === 'Admin-Anorganik') role = 'Anorganik';
    try {
        const banksampah = await BankSampah.aggregate(getDaftarNasabahAggregate(req,role));
        res.status(200).json(banksampah);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//untuk nampilin data verifikasi organik
// dah bener
exports.getAllUsersOrganik = async (req, res) => {
    try {   
        const banksampah = await BankSampah.aggregate(getAllUserOrganikAggregate(req));
        res.status(200).send(banksampah);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//untuk nampilin data verifikasi anorganik
// dah bener
exports.getAllUsersAnorganik = async (req, res) => {
    try {
        const banksampah = await BankSampah.aggregate(getAllUserAnorganikAggregate(req));
        res.status(200).json(banksampah);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}