const mailjet = require("../config/mailer");

const sendInviteEmail = async (email, name, activationLink) => {
  console.log("---------------------------------------------------");
  console.log("Preparing to send Invite Email");
  console.log("To:", email);
  console.log("Name:", name);
  console.log("Link:", activationLink);
  console.log("From (env):", process.env.from_email);
  console.log("---------------------------------------------------");

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.from_email,
          Name: "SkillUp Tech",
        },
        To: [
          {
            Email: email,
            Name: name,
          },
        ],
        Subject: "Action Required: Activate your SkillUp Account",
        HTMLPart: `
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
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">You have been invited to join SkillUp Tech's learning platform.</p>
                <p style="font-size: 16px;">Click the button below to set up your password and activate your account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${activationLink}" style="display: inline-block; background: #f57f17; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 5px;">
                    Activate Account
                  </a>
                </div>

                <p style="font-size: 14px; color: #555;">This link will expire in 7 days.</p>
                <p style="font-size: 14px; color: #555;">If you didn't expect this invitation, you can safely ignore this email.</p>

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
        `,
        TextPart: `
          Hello ${name},
          
          You have been invited to join SkillUp Tech's learning platform.
          
          Click the link below to set up your password and activate your account:
          ${activationLink}
          
          This link will expire in 7 days.
          
          If you didn't expect this invitation, you can safely ignore this email.
          
          © ${new Date().getFullYear()} SkillUp Tech Solutions. All rights reserved.
        `,
      },
    ],
  });

  try {
    const result = await request;
    console.log("Invite email sent successfully:", result.body);
    return result;
  } catch (err) {
    console.error("Failed to send invite email:", err.statusCode, err.message);
    throw err;
  }
};

module.exports = sendInviteEmail;
