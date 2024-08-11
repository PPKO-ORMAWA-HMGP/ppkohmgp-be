const BankSampah = require('../models/BankSampah');
const {convertDatetoMonthYear} = require('../services/convertDatetoTanggal');

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
            .select('users organik -_id')
            .populate({
                path : 'users',
                match : { role : 'Organik' },
                select : 'fullname'})
            .populate({
                path : 'organik',
                select : 'kriteria tanggal -_id',
                match : { kriteria : 'Menunggu' }
            });
        if (banksampah.length === 0) return res.status(404).json({ message: "No users found" });
        // Add the date to the users
        let data = [];
        console.log(banksampah);
        banksampah.users.forEach((user,index) => {
            const filteredbanksampah = new Object({
                _id: user._id,
                fullname: user.fullname,
                tanggal : banksampah.organik[index].tanggal
            });
            data.push(filteredbanksampah);
        });
        res.status(200).json(data);
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
    const {type} = req.query;
    if (!type) return res.status(404).json({ message: "Please provide type" });
    if (type === "anorganik") {
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
                anorganik.tanggal = convertDatetoMonthYear(anorganik.date);
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
    else if (type === "organik") {

    }
    else {
        res.status(404).json({ message: "Please provide valid type" });
    }
}