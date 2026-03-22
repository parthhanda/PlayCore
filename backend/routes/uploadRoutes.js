const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({
            message: 'Image uploaded successfully to GridFS',
            image: `/api/upload/image/${req.file.filename}`,
        });
    } else {
        res.status(400).send('No file uploaded');
    }
});

// GET route to serve images directly from MongoDB GridFS
router.get('/image/:filename', async (req, res) => {
    try {
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const files = await bucket.find({ filename: req.params.filename }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ err: 'No image exists with this filename' });
        }

        const file = files[0];
        
        // Stream the file back to the client natively
        if (file.contentType.includes('image')) {
            const readStream = bucket.openDownloadStreamByName(req.params.filename);
            res.set('Content-Type', file.contentType);
            readStream.pipe(res);
        } else {
            res.status(404).json({ err: 'Requested file is not an image' });
        }
    } catch (error) {
        console.error('GridFS streaming error:', error);
        res.status(500).json({ err: error.message });
    }
});

module.exports = router;
