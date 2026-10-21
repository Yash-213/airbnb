const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const ExpressError = require("./utils/ExpressError");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = multer.memoryStorage();

const cloudUpload = (req, res, next) => {
    if (!req.file) return next();

    const stream = cloudinary.uploader.upload_stream(
        { folder: 'airbnb_DEV' },
        (error, result) => {
            if (error) {
                const uploadError = new ExpressError(502, "Image upload failed");
                uploadError.cause = error;
                return next(uploadError);
            }

            if (!result || !result.secure_url || !result.public_id) {
                return next(new ExpressError(502, "Image upload did not return an image"));
            }

            req.file.path = result.secure_url;
            req.file.filename = result.public_id;

            next();
        }
    );

    stream.end(req.file.buffer);
};

module.exports = {
    storage,
    cloudUpload
};