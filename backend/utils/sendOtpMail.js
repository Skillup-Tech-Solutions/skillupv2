const mailjet = require("../config/mailer");

const sendOtpEmail = async (to, otp) => {
  const subject = "Skill Up Tech Solutions - OTP Verification";

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
            <div style="background-color: #ffffff; padding: 20px 30px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 0;">
              <tr>
                <td style="text-align: left;">
                  <h1 style="color: #f57f17; margin: 0; font-size: 22px;">Skill Up Tech Solutions</h1>
                </td>
                <td style="text-align: right;">
                  <img src="https://frontend-admin-panel-ecru.vercel.app/assets/newlogo-CpmjAHNb.png" alt="Skill Up Tech Logo" style="width: 50px; object-fit: cover;">
                </td>
              </tr>
            </table>
          </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000ff;">
          <p style="font-size: 16px; color: #000000ff;">Dear User,</p>
          <p style="font-size: 16px;">Your One Time Password (OTP) is:</p>
          
          <div style="font-size: 28px; font-weight: bold; color: #f57f17; text-align: left; margin: 20px 0;">
            ${otp}
          </div>

          <p style="font-size: 14px;">This OTP is valid for <strong>1 minute</strong> only.</p>
          <p style="font-size: 14px;">If you did not request this, please ignore the email.</p>

          <p style="margin-top: 30px; font-size: 14px;">Thanks,<br/>Skill Up Tech Solutions</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 13px; color: #555; margin-top: 40px;">
          <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 15px;">
          <p style="margin: 0 0 5px;">&copy; 2025 <a href="https://skilluptechbuzz.in/" style="color: #f57f17; text-decoration: none;">Skill Up Tech Solutions</a>. All rights reserved.</p>
          <p style="margin: 0 0 5px;">This is an auto-generated email. Do not reply.</p>
        </div>

      </div>
    </div>
  `;

  try {
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.from_email,
            Name: "Skill Up Tech Solutions",
          },
          To: [
            {
              Email: to,
              Name: "User",
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    await request;
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error.statusCode, error.message);
    throw error;
  }
};

module.exports = sendOtpEmail;
