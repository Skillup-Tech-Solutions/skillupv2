require('dotenv').config();
const b2Service = require('./utils/b2Service');
const axios = require('axios');

async function debugDownload() {
    try {
        console.log("--- Debugging Download 404 ---");

        // 1. Authorize
        console.log("1. Authorizing...");
        await b2Service.getB2().authorize();

        // 2. Get Info
        const downloadUrl = b2Service.getB2().downloadUrl; // Access internal property if possible or use cache
        // Actually, let's access the cache via a helper or just rely on the service's internal state if we can?
        // b2Service doesn't expose cache directly, but getSignedUrl uses it.

        const bucketName = process.env.B2_BUCKET_NAME;
        console.log(`Bucket Name from Env: '${bucketName}'`);

        // 3. Generate Signed URL for the file we uploaded earlier
        const fileName = "debug/test_file-1765180984808.txt"; // Use the one from previous step
        // Or create a new one to be sure

        console.log(`2. Generating Signed URL for: ${fileName}`);
        const url = await b2Service.getSignedUrl(fileName);
        console.log(`Generated URL: ${url}`);

        // Check if URL contains the bucket name
        if (!url.includes(bucketName)) {
            console.error("CRITICAL: URL does not contain bucket name!");
        }

        // 4. Attempt Download
        console.log("3. Attempting Download via Axios...");
        const response = await axios.get(url);
        console.log("Download Success! Status:", response.status);
        console.log("Content Length:", response.headers['content-length']);

    } catch (err) {
        console.error("--- Download Failed ---");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Status Text:", err.response.statusText);
            console.error("Data:", err.response.data);
            console.error("Headers:", err.response.headers);
            console.error("URL Attempted:", err.config.url);
        } else {
            console.error("Error:", err.message);
        }
    }
}

debugDownload();
