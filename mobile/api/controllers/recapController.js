const Recap = require ("../models/Recap");
const {convertDateToMonthYear} = require("../services/convertDatetoTanggal")
const BankSampah = require("../models/BankSampah");
const mongoose = require("mongoose");

//modular function for countNasabah
const filterData = (data, month, year) => {
    const filterOrganikbyMonthYear = data.filter(data => convertDateToMonthYear(data.date) === `${month} ${year}`)
    const filterOrganikbyUser = filterOrganikbyMonthYear.map(organik => organik.user.toString());
    const uniqueOrganikUser = filterOrganikbyUser.filter((item, index) => filterOrganikbyUser.indexOf(item) === index);
    return uniqueOrganikUser;
}

//modular function for countNasabah
const dataAggregatePipeline = (req, sampah, sampahLower) => {
    return [
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
            $match : { 'users.role' : sampah }
        },
        {
            $lookup : {
                from : `${sampahLower}s`,
                localField : `${sampahLower}`,
                foreignField : '_id',
                as : `${sampahLower}`
            }
        },
        {
            $unwind : `$${sampahLower}`
        },   
        {
            $project : {
                date : `$${sampahLower}.date`,
                user : `$${sampahLower}.user`,
                kriteria : `$${sampahLower}.kriteria`,
            }
        }
    ]
}

//modular function for countNasabah
const roleAggregatePipeline = (req, sampah) => {
    return [
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
            $match : { 'users.role' : sampah }
        },
        {
            $project : {
                user : '$users._id',
                _id : 0
            }
        }
    ]
}   

exports.countNasabah = async (req, res) => {
    const { month, year } = req.query;
    let { sampah } = req.query;
    if (sampah !== 'organik' && sampah !== 'anorganik') return res.status(404).json({ message: "Please enter a valid type!" });
    sampah === 'organik' ? sampah = 'Organik' : sampah = 'Anorganik';
    try {
        if (sampah === 'Organik' && req.user.role === 'Admin-Organik') {
            const data = await BankSampah.aggregate(dataAggregatePipeline(req, sampah, sampah.toLowerCase()));
            const filterKriteria = data.filter(data => data.kriteria === 'Diterima');
            const allUserOrganik = await BankSampah.aggregate(roleAggregatePipeline(req, sampah));
            res.status(200).json({
                "Jumlah warga yang sudah memilah sampah" : filterData(filterKriteria, month, year).length,
                "Jumlah warga yang sudah menjadi nasabah" : allUserOrganik.length
            });
        }
        else if (sampah === 'Anorganik' && req.user.role === 'Admin-Anorganik') {
            const data = await BankSampah.aggregate(dataAggregatePipeline(req, sampah, sampah.toLowerCase()));
            const allUserAnorganik = await BankSampah.aggregate([roleAggregatePipeline(req, sampah)]);
            res.status(200).json({
                "Jumlah warga yang sudah memilah sampah" : filterData(data,month,year).length,
                "Jumlah warga yang sudah menjadi nasabah" : allUserAnorganik.length
            });
        }
        else res.status(400).json({ message: "Please enter a valid type!" });
    }
    catch (error) {
        res.status(500).json(error.message);
    }
}

exports.sendRecap = async (req, res) => {
    let session;
    const {
        organik_padat,
        organik_cair,
        biopori_jumbo,
        biopori_komunal,
        biopori_mandiri,
        ember_tumpuk,
        iosida,
        jelantah,
        bagor,
        nasi_kering
    } = req.body
    const banksampah = await BankSampah.findById(req.user.bankSampah).select('name');
    const tanggal = convertDateToMonthYear(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const recap = new Recap({
            organik_padat,
            organik_cair,
            biopori_jumbo,
            biopori_komunal,
            biopori_mandiri,
            ember_tumpuk,
            iosida,
            jelantah,
            bagor,
            nasi_kering,
            tanggal,
            banksampah
        });
        const response = await Recap.findOne({tanggal, banksampah : banksampah._id});
        if (response) return res.status(400).json({message : `Recap pada ${banksampah.name} untuk ${tanggal} sudah ada`});
        await recap.save({session});
        await BankSampah.findByIdAndUpdate(banksampah._id, {$push : {recap : recap._id}}, {session});
        await session.commitTransaction();
        res.status(200).json({message : `Berhasil menambahkan data recap pada ${banksampah.name} untuk ${tanggal}`});
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json(error.message);
    }
    finally {
        if (session) session.endSession();
    }
}

exports.updateRecap = async (req, res) => {
    let session;
    const {
        organik_padat,
        organik_cair,
        biopori_jumbo,
        biopori_komunal,
        biopori_mandiri,
        ember_tumpuk,
        iosida,
        jelantah,
        bagor,
        nasi_kering,
    } = req.body
    const banksampah = await BankSampah.findById(req.user.bankSampah).select('name')
    const tanggal = convertDateToMonthYear(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const filter = {
            tanggal,
            banksampah : banksampah._id
        };
        const recap = await Recap.findOneAndUpdate(filter, {
            organik_padat,
            organik_cair,
            biopori_jumbo,
            biopori_komunal,
            biopori_mandiri,
            ember_tumpuk,
            iosida,
            jelantah,
            bagor,
            nasi_kering
        }, {session});
        if (!recap) return res.status(404).json({message : "Recap not found"});
        await session.commitTransaction();
        res.status(200).json({message : `Berhasil mengupdate data recap pada ${banksampah.name} untuk ${tanggal}`});
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json(error.message);
    }
    finally {
        if (session) session.endSession();
    }
}

// untuk admin
exports.getRecap = async (req, res) => {
    const { sampah, month, year } = req.query;
    if (!month || !year || !sampah) return res.status(404).json({ message: "Please fill the field!" });
    if (sampah !== 'organik' && sampah !== 'anorganik') return res.status(404).json({ message: "Please enter a valid type!" });

    if (req.user.role === 'Admin-Anorganik' && sampah === 'anorganik') {
        try {
            const banksampah = await BankSampah.findById(req.user.bankSampah)
                .populate({
                path : sampah,
                select : 'type mass date -_id'
            });
            banksampah.anorganik.forEach(anorganik => {
                anorganik.tanggal = convertDateToMonthYear(anorganik.date);
            });
            const filteredAnorganik = banksampah.anorganik.filter(anorganik => anorganik.tanggal === `${month} ${year}`);
            if (filteredAnorganik.length === 0) return res.sendStatus(204)
            const result = filteredAnorganik.reduce((acc, item) => {
                if (!acc[item.type]) {
                  acc[item.type] = 0;
                }
                acc[item.type] += item.mass;
                return acc;
              }, {});
              
            const groupedData = Object.keys(result).map(type => ({
                type,
                mass: result[type]
              }));
            const totalanorganik = groupedData.reduce((acc, item) => acc + item.mass, 0);
            
            const recap = await Recap.findOne({tanggal : `${month} ${year}`, banksampah : banksampah._id}).select('-_id -__v -tanggal -banksampah').lean();
            if (recap === null) recap.organik_padat = recap.organik_cair = recap.biopori_jumbo = recap.biopori_komunal = recap.biopori_mandiri = recap.ember_tumpuk = recap.iosida = recap.jelantah = recap.bagor = recap.nasi_kering = 0;
            const totalorganik = recap.organik_padat + recap.organik_cair;
            const totalbiopori = recap.biopori_jumbo + recap.biopori_komunal + recap.biopori_mandiri;
            const total_lain_lain = recap.ember_tumpuk + recap.iosida + recap.jelantah + recap.bagor + recap.nasi_kering;
            res.status(200).json({
                anorganik : groupedData,
                recap,
                totalanorganik,
                totalorganik,
                totalbiopori,
                total_lain_lain
                });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    else if (req.user.role === 'Admin-Organik' && sampah === 'organik') {
        try {
            const recap = await Recap.findOne({tanggal : `${month} ${year}`, banksampah : req.user.bankSampah}).select('-_id -__v -tanggal -banksampah').lean();
            const totalorganik = recap.organik_padat + recap.organik_cair;
            const totalbiopori = recap.biopori_jumbo + recap.biopori_komunal;
            const total_lain_lain = recap.biopori_mandiri + recap.ember_tumpuk + recap.iosida + recap.jelantah + recap.bagor + recap.nasi_kering;
            recap.totalorganik = totalorganik;
            recap.totalbiopori = totalbiopori;
            recap.total_lain_lain = total_lain_lain;
            res.status(200).json(recap);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    else {
        res.status(400).json({ message: "Please enter a valid type!" });
    }
}