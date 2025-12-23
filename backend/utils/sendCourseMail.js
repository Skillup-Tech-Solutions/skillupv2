const mailjet = require("../config/mailer");

const sendCourseMail = async (type, recipient, data, attachments = []) => {
    const { email, name } = recipient;
    const {
        courseName,
        courseId,
        startDate,
        endDate,
        timing,
        daysLeft
    } = data;

    const dashboardUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const courseLink = `${dashboardUrl}/#/student/my-courses`;

    let subject = "";
    let bodyContent = "";

    // Common styles
    const buttonStyle = "display: inline-block; background: #f57f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;";
    const highlightColor = "#f57f17";

    switch (type) {
        case "COURSE_WELCOME":
            subject = `Welcome to: ${courseName}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">You have been enrolled in the course <strong style="color: ${highlightColor};">${courseName}</strong>.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate ? new Date(startDate).toLocaleDateString() : 'TBA'}</p>
                    <p style="margin: 5px 0;"><strong>End Date:</strong> ${endDate ? new Date(endDate).toLocaleDateString() : 'TBA'}</p>
                    <p style="margin: 5px 0;"><strong>Timing:</strong> ${timing || 'TBA'}</p>
                </div>

                <p style="font-size: 14px;">Please log in to your dashboard to access course materials.</p>
                <a href="${courseLink}" style="${buttonStyle}">Go to My Courses</a>
            `;
            break;

        case "COURSE_ENDING":
            subject = `Course Ending Soon: ${courseName}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">This is a reminder that your course <strong style="color: ${highlightColor};">${courseName}</strong> is ending in <strong>${daysLeft} days</strong> (on ${new Date(endDate).toLocaleDateString()}).</p>
                <p style="font-size: 14px;">Please ensure you have completed all assignments and downloaded any necessary materials.</p>
                <a href="${courseLink}" style="${buttonStyle}">Go to My Courses</a>
            `;
            break;

        case "COURSE_COMPLETED":
            subject = `Analysis Completed: ${courseName}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Congratulations! You have successfully completed the course <strong style="color: ${highlightColor};">${courseName}</strong>.</p>
                <p style="font-size: 16px;">We are proud of your achievement.</p>
                ${attachments.length > 0 ? `<p style="font-size: 16px; margin-top: 20px;"><strong>Your Certificate of Completion is attached to this email.</strong></p>` : ''}
                <p style="margin-top: 30px;">Keep learning!</p>
            `;
            break;

        case "INTERNSHIP_COMPLETED":
            subject = `Internship Completed: ${courseName}`; // reusing courseName variable for title
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Congratulations! You have successfully completed your internship as <strong style="color: ${highlightColor};">${courseName}</strong>.</p>
                <p style="font-size: 16px;">We appreciate your dedication and hard work.</p>
                ${attachments.length > 0 ? `<p style="font-size: 16px; margin-top: 20px;"><strong>Your Internship Certificate is attached to this email.</strong></p>` : ''}
                <p style="margin-top: 30px;">Best wishes for your career!</p>
            `;
            break;

        case "PAYMENT_REQUEST":
            subject = `Payment Request: ${data.courseName} - SkillUp Technical`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">This is a request for payment regarding your course <strong style="color: ${highlightColor};">${data.courseName}</strong>.</p>
                <p style="font-size: 16px;"><strong>Amount Due: ₹${data.amount}</strong></p>
                ${data.notes ? `<p style="font-size: 14px; margin-top: 10px;"><em>Note: ${data.notes}</em></p>` : ""}
                <p style="font-size: 14px;">Please complete this payment to proceed.</p>
                <a href="${courseLink}" style="${buttonStyle}">View Payment Details</a>
            `;
            break;

        case "PAYMENT_RECEIVED":
            subject = `Payment Received: ${data.courseName} - SkillUp Technical`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">We have received your payment for the course <strong style="color: ${highlightColor};">${data.courseName}</strong>.</p>
                <p style="font-size: 16px;"><strong>Amount Paid: ₹${data.amount}</strong></p>
                <p style="font-size: 14px;">Thank you! You can now access your course materials.</p>
                <a href="${courseLink}" style="${buttonStyle}">Go to Course</a>
            `;
            break;

        default:
            return;
    }

    // Full HTML Template
    const fullHtml = `
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
                    <p style="color: #555; margin: 0; font-size: 14px;">Course Notification</p>
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
          <p style="margin: 0 0 5px;">&copy; ${new Date().getFullYear()} <a href="https://skilluptechbuzz.in/" style="color: #f57f17; text-decoration: none;">Skill Up Tech Solutions</a>. All rights reserved.</p>
          <p style="margin: 0 0 5px;">This is an auto-generated email. Do not reply.</p>
        </div>

      </div>
    </div>
    `;

    const messagePayload = {
        From: {
            Email: process.env.from_email,
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

    if (attachments && attachments.length > 0) {
        messagePayload.Attachments = attachments;
    }

    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [messagePayload],
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

module.exports = sendCourseMail;
