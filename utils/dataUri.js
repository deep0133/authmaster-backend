const path = require("path")
const DataUriParser = require('datauri/parser.js')
const axios = require('axios')

async function getDataUri(fileBuffer, fileExtension) {
    // if you already have a file Buffer:
    const buffer = Buffer.from(fileBuffer, 'binary');
    const parser = new DataUriParser();
    return parser.format(fileExtension, buffer); //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
};

// From image to file
async function imageUrlToDataURI(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const fileExtension = getFileExtensionFromUrl(imageUrl);
        return getDataUri(response.data, fileExtension);
    } catch (error) {
        throw error;
    }
}

function getFileExtensionFromUrl(fileUrl) {
    const urlPath = new URL(fileUrl).pathname;
    return path.extname(urlPath);
}

module.exports = {
    getDataUri,
    imageUrlToDataURI
}