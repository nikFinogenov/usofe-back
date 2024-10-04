const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the destination folder for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/avatars'; // Change path as necessary
        // Ensure the directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpeg, .jpg, .png, and .gif files are allowed'), false);
    }
};

// Set limits for file size (optional)
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // Limit to 5MB
    },
});

module.exports = upload;
