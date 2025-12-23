require('dotenv').config();

console.log("Checking Env Vars:");
console.log("keyID exists:", !!process.env.keyID);
console.log("applicationKey exists:", !!process.env.applicationKey);
console.log("B2_BUCKET_NAME exists:", !!process.env.B2_BUCKET_NAME);
console.log("keyName exists:", !!process.env.keyName);

const b2Service = require('./utils/b2Service');

async function test() {
    try {
        console.log("Attempting Authorize...");
        const auth = await b2Service.getB2().authorize();
        console.log("Authorize Result:", auth.status);
        console.log("Auth Data:", JSON.stringify(auth.data, null, 2));
    } catch (e) {
        console.error("Authorize Failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}

test();
