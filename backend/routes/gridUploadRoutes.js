const express = require('express');
const router = express.Router();
const uploadGrid = require('../middleware/uploadGrid');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

router.post('/gridfs', protect, (req, res) => {
    uploadGrid.single('image')(req, res, (err) => {
        if (err) {
            console.error('MULTER ERROR:', err);
            return res.status(500).json({ message: 'Multer Error', error: err.message || err });
        }
        
        if (req.file) {
            // Return statis URL format that our frontend can use to fetch the image directly
            return res.status(201).json({
                message: 'Image uploaded successfully to local storage',
                image: `/uploads/${req.file.filename}`,
                size: req.file.size
            });
        }
        
        console.error('No file processed by multer');
        return res.status(400).send('No file uploaded or file rejected (10MB limit / valid formats only)');
    });
});

module.exports = router;
