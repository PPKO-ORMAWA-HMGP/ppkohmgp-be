const Recap = require ("../models/Recap");
const {convertDateToMonthYear} = require("../services/convertDatetoTanggal")
const BankSampah = require("../models/BankSampah");
const mongoose = require("mongoose");

exports.countNasabah = async (req, res) => {
    const { month, year } = req.query;
    let { sampah } = req.query;
    if (sampah !== 'organik' && sampah !== 'anorganik') return res.status(404).json({ message: "Please enter a valid type!" });
    sampah === 'organik' ? sampah = 'Organik' : sampah = 'Anorganik';
    try {
        if (sampah === 'Organik') {
            const { users , organik } = await BankSampah.findById(req.user.bankSampah)
            .populate({
                    path : 'users',
                    select : '_id',
                    match : {role : sampah}
                })
            .populate({
                path : 'organik',
                select : 'date kriteria user -_id',
                match : {kriteria : "Diterima"}
            })
            .select('name users organik -_id');
            const filterOrganikbyMonthYear = organik.filter(organik => convertDateToMonthYear(organik.date) === `${month} ${year}`)
            const filterOrganikbyUser = filterOrganikbyMonthYear.map(organik => organik.user.toString());
            const uniqueOrganikUser = filterOrganikbyUser.filter((item, index) => filterOrganikbyUser.indexOf(item) === index);
            res.status(200).json({
                "Jumlah warga yang sudah memilah sampah" : uniqueOrganikUser.length,
                "Jumlah warga yang sudah menjadi nasabah" : users.length
            });
        }
        else {
            const { users , anorganik } = await BankSampah.findById(req.user.bankSampah)
            .populate({
                    path : 'users',
                    select : '_id',
                    match : {role : sampah}
                })
            .populate({
                path : 'anorganik',
                select : 'user date -_id',
            })
            .select('name users anorganik -_id');
            const filterAnorganikbyMonthYear = anorganik.filter(anorganik => convertDateToMonthYear(anorganik.date) === `${month} ${year}`)
            const filterAnorganikbyUser = filterAnorganikbyMonthYear.map(anorganik => anorganik.user.toString());
            const uniqueAnorganikUser = filterAnorganikbyUser.filter((item, index) => filterAnorganikbyUser.indexOf(item) === index);
            res.status(200).json({
                "Jumlah warga yang sudah memilah sampah" : uniqueAnorganikUser.length,
                "Jumlah warga yang sudah menjadi nasabah" : users.length
            });
        }
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
        organik_tatakura,
        organik_bigester,
        biopori_jumbo,
        biopori_komunal,
        ember_tumpuk,
        iosida
    } = req.body
    const banksampah = await BankSampah.findById(req.user.bankSampah).select('name');
    const tanggal = convertDateToMonthYear(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const recap = new Recap({
            organik_padat,
            organik_cair,
            organik_tatakura,
            organik_bigester,
            biopori_jumbo,
            biopori_komunal,
            ember_tumpuk,
            iosida,
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
        organik_tatakura,
        organik_bigester,
        biopori_jumbo,
        biopori_komunal,
        ember_tumpuk,
        iosida
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
            organik_tatakura,
            organik_bigester,
            biopori_jumbo,
            biopori_komunal,
            ember_tumpuk,
            iosida,
            tanggal,
            banksampah
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
            if (filteredAnorganik.length === 0) return res.status(204).json({ message: "No data found" });
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
            const totalorganik = recap.organik_padat + recap.organik_cair + recap.organik_tatakura + recap.organik_bigester;
            const totalbiopori = recap.biopori_jumbo + recap.biopori_komunal;
            res.status(200).json({
                anorganik : groupedData,
                recap,
                totalanorganik,
                totalorganik,
                totalbiopori
                });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    else if (req.user.role === 'Admin-Organik' && sampah === 'organik') {
        try {
            const recap = await Recap.findOne({tanggal : `${month} ${year}`, banksampah : req.user.bankSampah}).select('-_id -__v -tanggal -banksampah').lean();
            const totalorganik = recap.organik_padat + recap.organik_cair + recap.organik_tatakura + recap.organik_bigester;
            const totalbiopori = recap.biopori_jumbo + recap.biopori_komunal;
            recap.totalorganik = totalorganik;
            recap.totalbiopori = totalbiopori;
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