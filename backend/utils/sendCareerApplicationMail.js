const mailjet = require("../config/mailer");
const fs = require('fs');
const path = require('path');

const sendCareerApplicationMail = async (name, email, mobile, title, experience, resume = null) => {
  console.log('Sending career application mail with params:', { name, email, mobile, title, experience });

  // ... (keeping existing HTML generation)

  let attachments = [];
  if (resume) {
    try {
      // resume can be a path (old way, deprecated but supporting if needed?) or object { buffer, name }
      let filename, fileContent;

      if (typeof resume === 'string') {
        // It's a path
        filename = path.basename(resume);
        fileContent = fs.readFileSync(resume).toString('base64');
      } else if (resume.buffer && resume.name) {
        // It's a buffer object
        filename = resume.name;
        fileContent = resume.buffer.toString('base64');
      }

      if (filename && fileContent) {
        attachments.push({
          ContentType: "application/octet-stream",
          Filename: filename,
          Base64Content: fileContent
        });
      }
    } catch (err) {
      console.error("Error reading resume attachment:", err);
    }
  }

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
              Email: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
              Name: "Admin",
            },
          ],
          ReplyTo: {
            Email: email,
            Name: name,
          },
          Subject: subject,
          HTMLPart: html,
          Attachments: attachments.length > 0 ? attachments : undefined
        },
      ],
    });

    await request;
    console.log("Career application email sent successfully");
  } catch (error) {
    console.error("Error sending career application email:", error.statusCode, error.message);
    throw error;
  }
};

module.exports = { sendCareerApplicationMail };