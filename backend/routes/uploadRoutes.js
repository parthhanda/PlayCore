const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({
            message: 'Image uploaded successfully',
            image: `/uploads/${req.file.filename}`,
        });
    } else {
        res.status(400).send('No file uploaded');
    }
});

module.exports = router;
