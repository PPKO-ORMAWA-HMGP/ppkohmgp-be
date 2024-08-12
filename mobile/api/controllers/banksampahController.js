const BankSampah = require('../models/BankSampah');
const {convertDatetoMonthYear, convertDatetoDayMonthYear} = require('../services/convertDatetoTanggal');

//untuk daftar nasabah
// dah bener
exports.getAllUsers = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : {$or:[{ role : 'Organik' } , {role : "Anorganik"}]},
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

//untuk nampilin data rekapan bulan ini
// dah bener
exports.getRecapbyDate = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(404).json({ message: "Please fill the field!" });
        const banksampah = await BankSampah.findById(req.user.bankSampah)
            .populate({
                path : type,
                select : 'price type mass date'
            });
            
        let totalmass = 0;
        banksampah.anorganik.forEach(anorganik => {
            anorganik.tanggal = convertDatetoMonthYear(anorganik.date);
            anorganik.price = anorganik.price * anorganik.mass;
            totalmass += anorganik.mass;
        });
        
        const filteredAnorganik = banksampah.anorganik.filter(anorganik => anorganik.tanggal === date);
        if (filteredAnorganik.length === 0) return res.status(404).json({ message: "No data found" });
        const result = filteredAnorganik.map(item => ({
            type: item.type,
            mass: item.mass,
            price: item.price
        }));
        res.status(200).json({result, totalmass});
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}