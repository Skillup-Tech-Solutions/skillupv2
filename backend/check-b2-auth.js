require('dotenv').config();
const b2Service = require('./utils/b2Service');

async function testAuth() {
    try {
        console.log("Testing B2 Auth...");

        // Authorize first
        await b2Service.getB2().authorize();
        console.log("Authorization Successful!");

        const bucketName = process.env.B2_BUCKET_NAME;
        console.log("Looking for bucket:", bucketName);

        const buckets = await b2Service.getB2().listBuckets();
        const bucket = buckets.data.buckets.find(b => b.bucketName === bucketName);

        if (bucket) {
            console.log("Bucket found:", bucket.bucketId);

            // Try to get upload URL to confirm full access
            const uploadUrl = await b2Service.getB2().getUploadUrl({ bucketId: bucket.bucketId });
            console.log("Get Upload URL Successful!", uploadUrl.data.uploadUrl ? "Yes" : "No");

        } else {
            console.error("Bucket NOT found!");
        }

    } catch (err) {
        console.error("B2 Verification Failed:", err);
        // Print details if axios error
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

testAuth();
