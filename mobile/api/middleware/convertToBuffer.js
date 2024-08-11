const multer = require("multer");
const MulterError = require("multer").MulterError;

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(new MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
};

const convertToBuffer = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 2,
        files: 5,
    },
    fileFilter,
});

module.exports = convertToBuffer;