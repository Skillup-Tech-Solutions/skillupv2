const mailjet = require("../config/mailer");

/**
 * Sends Payslip related emails
 * @param {String} type - 'PAYSLIP_ATTACHMENT' | 'PAYSLIP_LINK'
 * @param {Object} recipient - { email, name }
 * @param {Object} data - { month, year, link, amount, fileBuffer, fileName }
 */
const sendPayslipEmail = async (type, recipient, data) => {
    const { email, name } = recipient;
    const { month, year, link, amount, fileBuffer, fileName } = data;

    let subject = "";
    let bodyContent = "";

    // Highlight color matching OTP design
    const highlightColor = "#f57f17"; // Orange for consistency with OTP
    const buttonStyle = "display: inline-block; background: #f57f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;";

    switch (type) {
        case "PAYSLIP_ATTACHMENT":
            subject = `Payslip for ${month} ${year}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Dear ${name},</p>
                <p style="font-size: 16px;">Your payslip for <strong style="color: ${highlightColor};">${month} ${year}</strong> has been generated.</p>
                <p style="font-size: 14px;">Please find the attached PDF for details.</p>
            `;
            break;

        case "PAYSLIP_LINK":
            subject = `Payslip Available: ${month} ${year}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Dear ${name},</p>
                <p style="font-size: 16px;">Your payslip for <strong style="color: ${highlightColor};">${month} ${year}</strong> is now available.</p>
                <p style="font-size: 14px;">You can view and download it from the employee portal securely.</p>
                <a href="${link}" style="${buttonStyle}">View Payslip</a>
            `;
            break;

        default:
            throw new Error("Invalid email type");
    }

    const fullHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background-color: #ffffff; padding: 20px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 0;">
            <tr>
              <td style="text-align: left;">
                <h1 style="color: ${highlightColor}; margin: 0; font-size: 22px;">Skill Up Tech Solutions</h1>
              </td>
              <td style="text-align: right;">
                <img src="https://frontend-admin-panel-ecru.vercel.app/assets/newlogo-CpmjAHNb.png" alt="Skill Up Tech Logo" style="width: 50px; object-fit: cover;">
              </td>
            </tr>
          </table>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000ff;">
          ${bodyContent}
          <p style="margin-top: 30px; font-size: 14px;">Thanks,<br/>Skill Up Tech Solutions</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 13px; color: #555; margin-top: 40px;">
          <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 15px;">
          <p style="margin: 0 0 5px;">&copy; 2025 <a href="https://skilluptechbuzz.in/" style="color: ${highlightColor}; text-decoration: none;">Skill Up Tech Solutions</a>. All rights reserved.</p>
          <p style="margin: 0 0 5px;">This is an auto-generated email. Do not reply.</p>
        </div>
      </div>
    </div>
    `;

    const message = {
        From: {
            Email: process.env.from_email || "admin@skillup.com",
            Name: "Skill Up Tech Solutions",
        },
        To: [
            {
                Email: email,
                Name: name,
            },
        ],
        Subject: subject,
        HTMLPart: fullHtml,
    };

    // Attach File if provided (Base64 encoding handled by mailjet usually requires Base64 content)
    if (type === "PAYSLIP_ATTACHMENT" && fileBuffer) {
        message.Attachments = [
            {
                ContentType: "application/pdf",
                Filename: fileName || `Payslip_${month}_${year}.pdf`,
                Base64Content: fileBuffer.toString("base64")
            }
        ];
    }

    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [message],
    });

    try {
        const result = await request;
        console.log(`[Email] Sent ${type} to ${email}`);
        return result;
    } catch (err) {
        console.error(`[Email] Failed to send ${type}:`, err.message);
        throw err;
    }
};

module.exports = sendPayslipEmail;
