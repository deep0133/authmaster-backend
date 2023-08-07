const multer = require("multer")

const storage = multer.memoryStorage()
// Set the file size limit to 5MB (5 * 1024 * 1024 bytes)
const singleUpload = multer({
    storage,
}).single('file');

module.exports = singleUpload