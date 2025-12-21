const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = multer.memoryStorage();

// This is your custom middleware "Bridge"
const cloudUpload = (req, res, next) => {
    if (!req.file) return next();

    // 1. Start the upload stream
    const stream = cloudinary.uploader.upload_stream(
        { folder: 'airbnb_DEV' },
        (error, result) => {
            if (error) {
                return res.status(500).json({ error: "Cloudinary Upload Failed", details: error });
            }
            
            // 2. THIS IS CRITICAL: Assign the path inside the callback
            req.file.path = result.secure_url;
            req.file.filename = result.public_id;
            
            // 3. ONLY call next() once the upload is actually finished
            next(); 
        }
    );

    // 4. Send the buffer to the stream
    stream.end(req.file.buffer);
};

module.exports = {
    storage,
    cloudUpload
};