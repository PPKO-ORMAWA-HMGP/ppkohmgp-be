const BankSampah = require('../models/BankSampah');

exports.getAllUsers = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : {$or:[{ role : 'Organik' } , {role : "Anorganik"}]},
                select : 'username fullname phoneNumber'
            });
        if (!banksampah) return res.status(404).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllUsersOrganik = async (req, res) => {
    try {   
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : { role : 'Organik' },
                options : {sort : {date : -1}},
                select : 'username fullname phoneNumber'
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

exports.getAllUsersAnorganik = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.bankSampah)
            .populate({
                path : 'users',
                match : { role : 'Anorganik' },
                select : 'username fullname phoneNumber'
            });
        if (!banksampah) return res.status(404).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getRecapPerPeriod = async (req, res) => {
    try {
        const banksampah = await BankSampah.findById(req.user.bankSampah)
            .populate(
                {
                    path : 'users',
                    select : 'mass date'
                })
            .select('-name -address')
        if (!banksampah) return res.status(404).json({ message: "No users found" });
        res.status(200).json({jumlah : `${banksampah.users.length} Orang`});
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}