const BankSampah = require('../models/BankSampah');
const moment = require('moment');

//untuk daftar nasabah
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

//untuk verifikasi organik
exports.getAllUsersOrganik = async (req, res) => {
    try {   
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : { role : 'Organik' },
                options : {sort : {date : -1}},
                select : 'username'
            });
        if (!banksampah) return res.status(404).json({ message: "No users found" });
        banksampah.users.forEach (user => {
            const formattedDate = moment.utc(user.date).format('DD MMMM YYYY');
            const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
            user.tanggal = indonesianDate;
        })
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//untuk verifikasi anorganik
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

exports.getRecapbyDate = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(404).json({ message: "Please fill the field!" });
        const banksampah = await BankSampah.findById(req.user.bankSampah)
            .populate({
                path : 'anorganik',
                select : 'price description mass date'
            });
            
        let totalmass = 0;
        banksampah.anorganik.forEach(anorganik => {
            const formattedDate = moment.utc(anorganik.date).format('MMMM YYYY');
            const indonesianDate = formattedDate.replace("January", "Januari").replace("February", "Februari").replace("March", "Maret").replace("April", "April").replace("May", "Mei").replace("June", "Juni").replace("July", "Juli").replace("August", "Agustus").replace("September", "September").replace("October", "Oktober").replace("November", "November").replace("December", "Desember");
            anorganik.tanggal = indonesianDate;
            anorganik.price = anorganik.price * anorganik.mass;
            totalmass += anorganik.mass;
        });
        
        const filteredAnorganik = banksampah.anorganik.filter(anorganik => anorganik.tanggal === date);
        if (filteredAnorganik.length === 0) return res.status(404).json({ message: "No data found" });
        const result = filteredAnorganik.map(item => ({
            description: item.description,
            mass: item.mass,
            price: item.price
        }));
        res.status(200).json({result, totalmass});
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}