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
        
        if (!req.file) {
            console.error('No file processed by multer');
            return res.status(400).send('No file uploaded or file rejected (10MB limit / valid formats only)');
        }

        try {
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: 'uploads'
            });

            const uniqueFilename = `${req.file.fieldname}-${Date.now()}-${req.file.originalname}`;
            
            const uploadStream = bucket.openUploadStream(uniqueFilename, {
                contentType: req.file.mimetype
            });

            uploadStream.end(req.file.buffer);

            uploadStream.on('finish', () => {
                return res.status(201).json({
                    message: 'Image uploaded successfully to GridFS',
                    image: `/api/upload/image/${uniqueFilename}`,
                    size: req.file.size
                });
            });

            uploadStream.on('error', (uploadErr) => {
                console.error('GridFS Upload Error:', uploadErr);
                return res.status(500).json({ message: 'Error saving to GridFS', error: uploadErr.message });
            });
        } catch (dbErr) {
            console.error('GridFS connection error:', dbErr);
            return res.status(500).json({ message: 'Database error', error: dbErr.message });
        }
    });
});

module.exports = router;
