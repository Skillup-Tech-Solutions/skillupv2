
require('dotenv').config();
const Mailjet = require('node-mailjet');

const recipient = "skilluptechsolution@gmail.com";
const sender = process.env.from_email;
const apiKey = process.env.API_KEY || process.env.mail_api;
const secretKey = process.env.SECRET_KEY || process.env.secret_key;

console.log("---------------------------------------------------");
console.log("              EMAIL DELIVERY TEST                  ");
console.log("---------------------------------------------------");
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Sender (From .env):   ${sender}`);
console.log(`Recipient:            ${recipient}`);
console.log(`API Key Present:      ${!!apiKey}`);
console.log(`Secret Key Present:   ${!!secretKey}`);

if (!apiKey || !secretKey || !sender) {
    console.error("❌ CRITICAL ERROR: Missing configuration variables in .env!");
    console.log("Please ensure API_KEY, SECRET_KEY, and from_email are set.");
    process.exit(1);
}

const mailjet = Mailjet.apiConnect(apiKey, secretKey);

console.log("Attempting to send email via Mailjet API...");

const request = mailjet
    .post("send", { 'version': 'v3.1' })
    .request({
        "Messages": [
            {
                "From": {
                    "Email": sender,
                    "Name": "SkillUp Debugger"
                },
                "To": [
                    {
                        "Email": recipient,
                        "Name": "Admin"
                    }
                ],
                "Subject": `Debug Email Test - ${new Date().toLocaleTimeString()}`,
                "TextPart": "This is a test email to verify delivery. If you see this, the backend is working correctly.",
                "HTMLPart": `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #4CAF50; border-radius: 10px;">
                        <h2 style="color: #4CAF50;">✅ Email Delivery Test</h2>
                        <p><strong>Timestamp:</strong> ${new Date().toString()}</p>
                        <p><strong>Sender:</strong> ${sender}</p>
                        <p>If you are reading this, the email pipeline from Node.js to Mailjet is functioning.</p>
                        <hr>
                        <p style="font-size: 12px; color: #666;">Please check your Spam/Junk folder if this landed there.</p>
                    </div>
                `
            }
        ]
    });

request
    .then((result) => {
        console.log("✅ Mailjet API Response: SUCCESS");
        console.log("Status:", result.body.Messages[0].Status);
        console.log("To:", result.body.Messages[0].To[0].Email);
        console.log("MessageHref:", result.body.Messages[0].MessageHref);
        console.log("\nIf the email does not arrive, please check:");
        console.log("1. Spam/Junk Folder");
        console.log("2. Mailjet Dashboard -> Stats/Logs (to see if it bounced or was blocked)");
        console.log("3. Verify that '" + sender + "' is a Validated Sender in Mailjet.");
    })
    .catch((err) => {
        console.error("❌ Mailjet API Error: FAILED");
        console.error("Status Code:", err.statusCode);
        console.error("Error Message:", err.message);
        if (err.response) {
            console.error("Details:", JSON.stringify(err.response.data, null, 2));
        }
    });
