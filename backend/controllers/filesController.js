const b2Service = require("../utils/b2Service");

const downloadProxy = async (req, res) => {
    try {
        const fileName = req.query.file;
        if (!fileName) {
            return res.status(400).json({ success: false, message: "File name is required" });
        }

        // Generate signed URL
        const signedUrl = await b2Service.getSignedUrl(fileName);
        console.log(`[Download] Generated signed URL for ${fileName}: ${signedUrl}`);

        // Redirect user to the signed URL
        res.redirect(signedUrl);
    } catch (error) {
        console.error("File download error for:", req.query.file, error);
        res.status(500).json({ success: false, message: "Failed to generate download link", error: error.message });
    }
};

module.exports = {
    downloadProxy
};
