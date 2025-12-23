require('dotenv').config();
const b2Service = require('./utils/b2Service');

async function testSignedUrl() {
    try {
        console.log("Testing Signed URL Generation...");

        // Ensure auth first
        await b2Service.getB2().authorize();

        const fileName = "debug/test_file-1765180984808.txt"; // Use a known existing file if possible
        const url = await b2Service.getSignedUrl(fileName);

        console.log("Generated Signed URL:", url);

        // Validate URL format (should contain Authorization token)
        if (url.includes("Authorization=") && url.includes("https://")) {
            console.log("URL Format Valid!");
        } else {
            console.error("URL Format Invalid!");
        }

    } catch (err) {
        console.error("Signed URL Test Failed:", err);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

testSignedUrl();
