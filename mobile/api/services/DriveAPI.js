const drive  = require("../configs/GoogleDrive");
const stream = require("stream");

exports.generateLink = fileId => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

exports.uploadFile = async (tanggal, user, fileObject) => {
    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);
        const res = await drive.files.create ({
            media : {
                mimeType : fileObject.mimetype,
                body : bufferStream
            },
            requestBody : {
                name : `${tanggal}_${user}_${fileObject.originalname}`,
                parents : ["1-U5fhMmHLKavwZj1sFhzBMwaul87wsA5"]
            },
            fields : "id,name"
        });

        const fileId = res.data.id;

        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        })
        
        return {
            id : fileId,
            name : fileId.name
        };
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}