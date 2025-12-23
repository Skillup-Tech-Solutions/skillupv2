const mailjet = require("../config/mailer");

const sendContactMail = async (email, contactNumber, description, name) => {
  const subject = "Skill Up Tech Solutions - New Contact Form Submission";
  const html = `
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
          <h2 style="color: #f57f17; margin-top: 0; margin-bottom: 20px; font-size: 20px;">New Contact Form Submission</h2>

          <div style="margin-bottom: 20px;">
            <strong style="color: #333;">Name:</strong>
            <div style="background-color: #f8fafc; padding: 10px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #f57f17;">
              ${name}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <strong style="color: #333;">Email:</strong>
            <div style="background-color: #f8fafc; padding: 10px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #f57f17;">
              ${email}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <strong style="color: #333;">Contact Number:</strong>
            <div style="background-color: #f8fafc; padding: 10px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #f57f17;">
              ${contactNumber}
            </div>
          </div>

          ${description ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #333;">Description:</strong>
            <div style="background-color: #f8fafc; padding: 10px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #f57f17;">
              ${description}
            </div>
          </div>
          ` : ''}

          <div style="background-color: #eff6ff; border-left: 4px solid #f57f17; padding: 15px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; color: #f57f17; font-weight: bold;">Action Required:</p>
            <p style="margin: 5px 0 0 0; color: #333;">Please respond to the customer at <strong>${email}</strong></p>
            <p style="margin: 5px 0 0 0; color: #777; font-size: 12px;">Submitted on: ${new Date().toLocaleString()}</p>
          </div>

          <p style="margin-top: 30px; font-size: 14px;">Thanks,<br />Skill Up Tech Solutions</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 13px; color: #555; margin-top: 40px;">
          <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 15px;">
            <p style="margin: 0 0 5px;">&copy; ${new Date().getFullYear()} <a href="https://skilluptechbuzz.in/" style="color: #f57f17; text-decoration: none;">Skill Up Tech Solutions</a>. All rights reserved.</p>
            <p style="margin: 0 0 5px;">This is an auto-generated email. Do not reply.</p>
        </div>

      </div>
    </div >
  `;

  // Send to admin email (you can set this in environment variables)
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

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
              Email: adminEmail,
              Name: "Admin",
            },
          ],
          ReplyTo: {
            Email: email,
            Name: name,
          },
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    await request;
    console.log("Contact email sent successfully");
  } catch (error) {
    console.error("Error sending contact email:", error.statusCode, error.message);
    throw error;
  }
};

module.exports = { sendContactMail };