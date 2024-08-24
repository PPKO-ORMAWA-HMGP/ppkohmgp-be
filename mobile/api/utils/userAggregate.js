exports.getUserAnorganikAggregate = (id , role) => {
    return [
        {
            $match: { 
                $and :[
                { _id : id },
                { role : role }
            ]}
        },
        {
            $lookup: {
                from: "anorganiks",
                localField: "anorganik",
                foreignField: "_id",
                as: "anorganik"
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                anorganik: {
                    $map: {
                        input: "$anorganik",
                        as: "item",
                        in: {
                            description: "$$item.description",
                            mass: "$$item.mass",
                            price: { $multiply: ["$$item.price", "$$item.mass"] }
                        }
                    }
                },
                _id: 0,
                totalanorganik: { $size: "$anorganik" },
                massanorganik: { $sum: "$anorganik.mass" }
            }
        }
    ]
}

exports.getUserOrganikAggregate = (id , role) => {
    return [
        {
            $match: { 
                $and : [
                { _id : id },
                { role }
            ]}
        },
        {
            $lookup : {
                from : 'organiks',
                localField : 'organik',
                foreignField : '_id',
                as : 'organiks'
            }
        },
        {
            $project : {
                fullname : 1,
                username : 1,
                organiks : {
                    $filter : {
                        input : '$organiks',
                        as : 'item',
                        cond : { $eq : ['$$item.kriteria', 'Diterima'] }
                    }
                },
                _id : 0
            }
        },
        {
            $project : {
                fullname : 1,
                username : 1,
                totalorganik : { $size : '$organiks' }
            }
        }
    ]
}