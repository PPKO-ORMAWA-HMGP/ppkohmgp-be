exports.getDaftarNasabahAggregate = (req,role) => {
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
    ]
}

exports.getAllUserOrganikAggregate = (req) => {
    return [
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
    ]
}

exports.getAllUserAnorganikAggregate = (req) => {
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
            $match : { 'users.role' : 'Anorganik' }
        },
        {
            $project : {
                fullname : '$users.fullname'
            }
        }
    ]
}