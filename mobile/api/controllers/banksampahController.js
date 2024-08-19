const BankSampah = require('../models/BankSampah');

//untuk daftar nasabah
// dah bener
exports.getDaftarNasabah = async (req, res) => {
    let role = req.user.role;
    if (role === 'Admin-Organik') role = 'Organik';
    if (role === 'Admin-Anorganik') role = 'Anorganik';
    try {
        const banksampah = await BankSampah.aggregate([
            {
                $match : { _id : req.user.bankSampah }
            },
            {
                $lookup : {
                    from : 'users',
                    localField : 'users',
                    foreignField : '_id',
                    as : 'users'
                }
            },
            {
                $unwind : '$users'
            },
            {
                $match : { 'users.role' : role }
            },
            {
                $project : {
                    _id : '$users._id',
                    fullname : '$users.fullname',
                    username : '$users.username',
                    balance : '$users.balance',
                    poin : '$users.point'
                }
            }
        ]);
        if (banksampah.length === 0) return res.sendStatus(204)
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
        const banksampah = await BankSampah.aggregate([
            {
                $match : { _id : req.user.bankSampah }
            },
            {
                $lookup : {
                    from : 'organiks',
                    localField : 'organik',
                    foreignField : '_id',
                    as : 'organik'
                }
            },
            {
                $unwind : '$organik'
            },
            {
                $match : { 'organik.kriteria' : 'Menunggu' }
            },
            {
                $lookup : {
                    from : 'users',
                    localField : 'organik.user',
                    foreignField : '_id',
                    as : 'organik.user'
                }
            },
            {
                $unwind : '$organik.user'
            },
            {
                $project : {
                    _id : '$organik._id',
                    fullname : '$organik.user.fullname',
                    tanggal : '$organik.tanggal'
                }
            }
        ]);
        if (banksampah.length === 0) return res.sendStatus(204);
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
        const banksampah = await BankSampah.aggregate([
            {
                $match : { _id : req.user.bankSampah }
            },
            {
                $lookup : {
                    from : 'users',
                    localField : 'users',
                    foreignField : '_id',
                    as : 'users'
                }
            },
            {
                $unwind : '$users'
            },
            {
                $match : { 'users.role' : 'Anorganik' }
            },
            {
                $project : {
                    fullname : '$users.fullname'
                }
            }
        ]);
        if (banksampah.length === 0) return res.sendStatus(204);
        res.status(200).json(banksampah);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}