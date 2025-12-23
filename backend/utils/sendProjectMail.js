const mailjet = require("../config/mailer");

const sendProjectEmail = async (type, recipient, data) => {
    const { email, name } = recipient;
    const {
        projectTitle,
        projectId,
        studentName,
        adminName,
        requirementSummary,
        rejectionReason,
        paymentAmount,
        downloadLink,
        filesList,
        feedbackLink
    } = data;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@skillup.com";
    const dashboardUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const projectLink = `${dashboardUrl}/#/student/my-projects?projectId=${projectId}`;
    const adminLink = `${dashboardUrl}/#/project-submissions?projectId=${projectId}`;

    let subject = "";
    let bodyContent = "";

    // Common styles matching OTP email
    const buttonStyle = "display: inline-block; background: #f57f17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;";
    const highlightColor = "#f57f17";

    switch (type) {
        case "PROJECT_ASSIGNED":
            subject = `New Project Assigned: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">You have been assigned a new project: <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px;">Please log in to your dashboard to view the details and submit your requirements.</p>
                <a href="${projectLink}" style="${buttonStyle}">View Project</a>
            `;
            break;

        case "REQUIREMENT_SUBMITTED": // To Admin
            subject = `Requirement Submitted: ${projectTitle} by ${studentName}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello Admin,</p>
                <p style="font-size: 16px;">Student <strong>${studentName}</strong> has submitted requirements for <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px;"><strong>Summary:</strong> ${requirementSummary || "See details in portal"}</p>
                <a href="${adminLink}" style="${buttonStyle}">Review Submission</a>
            `;
            break;

        case "REQUIREMENT_SUBMITTED_BY_ADMIN":
            subject = `Project Requirements Updated: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">The admin has submitted/updated the requirements for your project <strong style="color: ${highlightColor};">${projectTitle}</strong> on your behalf.</p>
                <p style="font-size: 14px;">Please review the details in your dashboard.</p>
                <a href="${projectLink}" style="${buttonStyle}">View Details</a>
            `;
            break;

        case "REQUIREMENT_APPROVED":
            subject = `Requirement Approved: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Your requirements for <strong style="color: ${highlightColor};">${projectTitle}</strong> have been approved.</p>
                <p style="font-size: 14px;">Our team will now proceed with the next steps (payment or development).</p>
                <a href="${projectLink}" style="${buttonStyle}">Track Progress</a>
            `;
            break;

        case "REQUIREMENT_REJECTED":
            subject = `Action Required: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">We need some more details regarding your requirements for <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px; background: #fff3e0; padding: 10px; border-left: 4px solid ${highlightColor};"><strong>Note:</strong> ${rejectionReason}</p>
                <p style="font-size: 14px;">Please update your submission.</p>
                <a href="${projectLink}" style="${buttonStyle}">Update Requirement</a>
            `;
            break;

        case "PAYMENT_REQUEST":
            subject = `Payment Required: ${projectTitle}`;
            // Prefer assignmentId if passed so payment page can open specific assignment
            const paymentLink = data.assignmentId ? `${dashboardUrl}/#/student/pay?assignmentId=${data.assignmentId}` : `${dashboardUrl}/#/student/my-projects?projectId=${projectId}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">To proceed with <strong style="color: ${highlightColor};">${projectTitle}</strong>, a payment of <strong>₹${paymentAmount}</strong> is required.</p>
                <p style="font-size: 14px;">Please use the button below to complete the payment.</p>
                <a href="${paymentLink}" style="${buttonStyle}">Pay Now</a>
            `;
            break;

        case "PAYMENT_CONFIRMATION":
            subject = `Payment Received: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">We have received your payment for <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px;">Project development will now begin. You can track the status in your dashboard.</p>
                <a href="${projectLink}" style="${buttonStyle}">Track Status</a>
            `;
            break;

        case "PROJECT_STARTED":
            subject = `Development Started: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Our team has started working on your project <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px;">We will keep you updated on the progress.</p>
                <a href="${projectLink}" style="${buttonStyle}">Track Status</a>
            `;
            break;

        case "PROJECT_PREVIEW":
            subject = `Project Preview: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Your project <strong style="color: ${highlightColor};">${projectTitle}</strong> is almost ready!</p>
                <p style="font-size: 14px;">We are finalizing the details and it will be delivered shortly (within 24-48 hours).</p>
                <a href="${projectLink}" style="${buttonStyle}">Check Status</a>
            `;
            break;

        case "PROJECT_READY":
            subject = `Project Ready for Download: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Great news! The final files for <strong style="color: ${highlightColor};">${projectTitle}</strong> have been uploaded.</p>
                <p style="font-size: 14px;"><strong>Files Available:</strong> ${filesList || "Report, Code, PPT, etc."}</p>
                <p style="font-size: 14px;">Please log in to download your project.</p>
                <a href="${projectLink}" style="${buttonStyle}">Download Files</a>
            `;
            break;

        case "READY_FOR_DEMO":
            subject = `Project Ready for Demo: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">We have completed the work for <strong style="color: ${highlightColor};">${projectTitle}</strong> and it is ready for a demo.</p>
                <p style="font-size: 14px;">Please check your dashboard or contact us to schedule the demo.</p>
                <a href="${projectLink}" style="${buttonStyle}">View Dashboard</a>
            `;
            break;

        case "FINAL_PAYMENT_REQUEST":
            subject = `Final Payment Required: ${projectTitle}`;
            const finalPaymentLink = data.assignmentId ? `${dashboardUrl}/#/student/pay?assignmentId=${data.assignmentId}` : `${dashboardUrl}/#/student/my-projects?projectId=${projectId}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">The demo for <strong style="color: ${highlightColor};">${projectTitle}</strong> is complete.</p>
                <p style="font-size: 16px;">Please complete the final payment of <strong>₹${paymentAmount}</strong> to download the delivery files.</p>
                <a href="${finalPaymentLink}" style="${buttonStyle}">Pay Now</a>
            `;
            break;

        case "FEEDBACK_REQUEST":
            subject = `How was your experience? - ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">We hope you are happy with your project <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px;">Please take a moment to rate your experience and provide feedback.</p>
                <a href="${projectLink}" style="${buttonStyle}">Give Feedback</a>
            `;
            break;

        case "STUDENT_DOWNLOADED": // To Admin
            subject = `Student Downloaded Project: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello Admin,</p>
                <p style="font-size: 16px;">Student <strong>${studentName}</strong> has downloaded the files for <strong style="color: ${highlightColor};">${projectTitle}</strong>.</p>
                <p style="font-size: 14px;">This project can be considered delivered.</p>
                <a href="${adminLink}" style="${buttonStyle}">View Project</a>
            `;
            break;

        case "PROJECT_COMPLETED":
            subject = `Project Completed: ${projectTitle}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px;">Congratulations! Your project <strong style="color: ${highlightColor};">${projectTitle}</strong> has been marked as completed.</p>
                <p style="font-size: 14px;">Thank you for choosing Skill Up Tech. We wish you all the best!</p>
                <p style="font-size: 14px; color: #777;">Note: Your files will remain available in your dashboard.</p>
                <a href="${projectLink}" style="${buttonStyle}">View Dashboard</a>
            `;
            break;

        case "PAYMENT_PROOF_UPLOADED": // To Admin
            subject = `Payment Proof Uploaded: ${data.itemType} - ${data.itemName}`;
            bodyContent = `
                <p style="font-size: 16px; color: #000000ff;">Hello Admin,</p>
                <p style="font-size: 16px;">Student <strong>${data.studentName}</strong> has uploaded payment proof for <strong style="color: ${highlightColor};">${data.itemName}</strong> (${data.itemType}).</p>
                <p style="font-size: 14px;"><strong>Amount:</strong> ₹${data.amount || 0}</p>
                <p style="font-size: 14px;"><strong>Payment Method:</strong> ${data.paymentMethod || "Not specified"}</p>
                <p style="font-size: 14px;">Please review the proof and mark the payment as received.</p>
                <a href="${dashboardUrl}/#/payment-management" style="${buttonStyle}">View Pending Payments</a>
            `;
            break;

        default:
            return;
    }

    // Full HTML Template matching OTP email
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
          <p style="margin: 0 0 5px;">&copy; ${new Date().getFullYear()} <a href="https://skilluptechbuzz.in/" style="color: #f57f17; text-decoration: none;">Skill Up Tech Solutions</a>. All rights reserved.</p>
          <p style="margin: 0 0 5px;">This is an auto-generated email. Do not reply.</p>
        </div>

      </div>
    </div>
    `;

    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
            {
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
            },
        ],
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

module.exports = sendProjectEmail;
