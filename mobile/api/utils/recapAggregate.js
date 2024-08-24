const { convertDateToMonthYear } = require('../services/convertDatetoTanggal');

exports.recapData = () => {
    organik_padat,
    organik_cair,
    biopori_jumbo,
    biopori_komunal,
    biopori_mandiri,
    organik_mandiri,
    residu_plastik,
    ember_tumpuk,
    iosida,
    jelantah,
    bagor,
    nasi_kering
}

//modular function for countNasabah
exports.filterData = (data, month, year) => {
    const filterOrganikbyMonthYear = data.filter(data => convertDateToMonthYear(data.date) === `${month} ${year}`)
    const filterOrganikbyUser = filterOrganikbyMonthYear.map(organik => organik.user.toString());
    const uniqueOrganikUser = filterOrganikbyUser.filter((item, index) => filterOrganikbyUser.indexOf(item) === index);
    return uniqueOrganikUser;
}

//modular function for countNasabah
exports.dataAggregatePipeline = (req, sampah, sampahLower) => {
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
exports.roleAggregatePipeline = (req, sampah) => {
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