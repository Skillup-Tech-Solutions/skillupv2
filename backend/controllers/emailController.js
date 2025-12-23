const transporter = require('../config/mailer');
const generateHtml = require('../utils/template');
const generatePDF = require('../utils/pdfGenerator');
const fs = require('fs');

exports.sendEmail = async (req, res) => {
  const { name, email, certification, fromDate, toDate, courseName } = req.body;
  const htmlContent = generateHtml({ name, certification, fromDate, toDate, courseName });

  const pdfFileName = `certificate_${Date.now()}.pdf`;

  try {
    const pdfPath = await generatePDF({ name, email, certification, fromDate, toDate, courseName }, pdfFileName);
    const info = await transporter.sendMail({
      from: `"Training Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Course Certification Info',
      html: htmlContent,
      attachments: [
        {
          filename: pdfFileName,
          path: pdfPath
        }
      ]
    });

    fs.unlinkSync(pdfPath);
    
    res.status(200).json({ message: 'Email sent with PDF attached', info });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
};
