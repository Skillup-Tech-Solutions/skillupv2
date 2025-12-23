const mailjet = require("../config/mailer");

const sendResetPasswordMail = async (to, name, resetLink) => { // ✅ Correct folder is "assets", not "asserts"

  const subject = "Skill Up Tech Solutions - Password Reset Request";
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
          <p style="font-size: 16px; color: #000000ff;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">We received a request to reset your password for your <strong>Skill Up Tech Solutions</strong> account.</p>
          <p style="font-size: 16px;">Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #f57f17; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 5px;">
              Reset My Password
            </a>
          </div>

          <div style="background-color: #fff3e0; border-left: 4px solid #f57f17; padding: 15px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; color: #e65100; font-weight: bold;">⚠️ Important Security Information:</p>
            <ul style="margin: 10px 0 0 0; color: #e65100; padding-left: 20px;">
              <li>This link will expire in <strong>15 minutes</strong></li>
              <li>This link can only be used once</li>
              <li>If you didn't request this reset, please ignore this email</li>
            </ul>
          </div>

          <p style="margin-top: 30px; font-size: 14px;">Thanks,<br/>Skill Up Tech Solutions</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 13px; color: #555; margin-top: 40px;">
          <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 15px;">
          <p style="margin: 0 0 5px;">&copy; ${new Date().getFullYear()} <a href="https://skilluptechbuzz.in/" style="color: #f57f17; text-decoration: none;">Skill Up Tech Solutions</a>. All rights reserved.</p>
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
              Name: name,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    await request;
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Error sending reset password email:", error.statusCode, error.message);
    throw error;
  }
};

module.exports = { sendResetPasswordMail };
