const BankSampah = require('../models/BankSampah');

exports.getAllUsers = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.banksampah)
            .populate({
                path : 'users',
                select : 'username fullname phoneNumber'
            });
        if (!banksampah) return res.status(400).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllUsersOrganik = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.banksampah)
            .populate({
                path : 'users',
                select : 'username fullname phoneNumber',
                match : { role : 'Organik' },
                options : {sort : {date : -1}}
            });
        if (!banksampah) return res.status(400).json({ message: "No users found" });
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
            .findById(req.user.banksampah)
            .populate({
                path : 'users',
                select : 'username fullname phoneNumber',
                match : { role : 'Anorganik' }
            });
        if (!banksampah) return res.status(400).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}


exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username fullname phoneNumber');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    }
    catch {
        res.status(500).json({ message: error.message });
    }
}

exports.getRecap = async (req, res) => {
    try {
        const banksampah = await BankSampah
            .findById(req.user.banksampah)
            .populate({
                path : 'users',
                select : 'username fullname phoneNumber',
                match : { role : 'Organik' }
            });
        if (!banksampah) return res.status(400).json({ message: "No users found" });
        res.status(200).json(banksampah.users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}