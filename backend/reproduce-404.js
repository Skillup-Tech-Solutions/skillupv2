require('dotenv').config();
const b2Service = require('./utils/b2Service');

async function reproduce() {
    try {
        console.log("Starting Reproduction...");
        const buffer = Buffer.from("test content");
        const result = await b2Service.uploadFile(buffer, "test-file.txt", "debug");
        console.log("Upload Result:", result);
    } catch (err) {
        console.error("Reproduction Failed:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}

reproduce();
