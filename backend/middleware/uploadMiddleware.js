const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename(req, file, cb) {
        // Standardize filename: fieldname-timestamp.ext
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
