const BankSampah = require('../models/BankSampah');
const {convertDateToMonthYear} = require('../services/convertDatetoTanggal');

//untuk daftar nasabah
// dah bener
exports.getDaftarNasabah = async (req, res) => {
    let role = req.user.role;
    if (role === 'Admin-Organik') role = 'Organik';
    if (role === 'Admin-Anorganik') role = 'Anorganik';
    try {
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : { role : role},
                select : 'username fullname'
            });
        if (!banksampah) return res.status(404).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//untuk nampilin data verifikasi organik
// dah bener
exports.getAllUsersOrganik = async (req, res) => {
    try {   
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'organik',
                match : { kriteria : 'Menunggu' },
                populate : {
                    path : 'user',
                    select : 'fullname -_id'
                },
                select : 'tanggal'
            })
            .select('organik -_id');
        let data = [];
        banksampah.organik.forEach(organik => {
            data.push({
                _id : organik._id,
                tanggal : organik.tanggal,
                fullname : organik.user.fullname
            });
        });
        res.status(200).send(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//untuk nampilin data verifikasi anorganik
// dah bener
exports.getAllUsersAnorganik = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : { role : 'Anorganik' },
                select : 'fullname'
            });
        if (!banksampah) return res.status(404).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}