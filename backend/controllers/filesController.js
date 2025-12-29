const b2Service = require("../utils/b2Service");
const axios = require("axios");

const downloadProxy = async (req, res) => {
    try {
        const fileName = req.query.file;
        const mode = req.query.mode || 'attachment'; // 'attachment' or 'inline'

        if (!fileName) {
            return res.status(400).json({ success: false, message: "File name is required" });
        }

        // Generate signed URL from B2
        const signedUrl = await b2Service.getSignedUrl(fileName);
        console.log(`[Download] Streaming file ${fileName} through proxy (mode: ${mode})`);

        // Fetch the file from B2 and stream it to the client
        const response = await axios({
            method: 'GET',
            url: signedUrl,
            responseType: 'stream'
        });

        // Extract filename for Content-Disposition header
        const parts = fileName.split('/');
        const downloadName = parts[parts.length - 1];

        // Set appropriate headers
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);

        if (mode === 'inline') {
            res.setHeader('Content-Disposition', 'inline');
            // Remove nosniff for inline images if it helps ORB, 
            // but usually content-type is enough.
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
        }

        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        // Stream the file to the response
        response.data.pipe(res);

    } catch (error) {
        console.error("File download error for:", req.query.file, error);
        res.status(500).json({ success: false, message: "Failed to download file", error: error.message });
    }
};

module.exports = {
    downloadProxy
};
