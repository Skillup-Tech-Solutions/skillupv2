require('dotenv').config({ path: './backend/.env' });
const { sendInviteMail } = require('./utils/sendInviteMail');
const { sendResetMail } = require('./utils/sendResetMail');
const { sendPasswordMail } = require('./utils/sendPasswordMail');
const { sendContactMail } = require('./utils/sendContactMail');
const { sendCareerApplicationMail } = require('./utils/sendCareerApplicationMail');
const { sendCategoryMail } = require('./utils/sendCategoryMail');
const { sendCourseInquiryMail } = require('./utils/sendCourseInquiryMail');

console.log("All email utility files imported successfully. Syntax is correct.");
