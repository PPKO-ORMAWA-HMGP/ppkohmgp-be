const drive  = require("../configs/GoogleDrive");
const stream = require("stream");
require('dotenv').config();

exports.generateLink = fileId => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

exports.uploadFileEducation = async (id,fileObject) => {
    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);
        const res = await drive.files.create({
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream
            },
            requestBody: {
                name: `${id}_${fileObject.originalname}`,
                parents: [process.env.FOLDER_EDUCATION]
            },
            fields: "id, name"
        });
        const fileId = res.data.id;
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone"
            }
        });
        return {
            id: fileId,
            name: fileId.name
        };
    }
    catch (err) {
        throw err;
    }
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
                parents : [process.env.FOLDER_ORGANIK]
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