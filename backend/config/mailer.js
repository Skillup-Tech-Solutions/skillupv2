const Mailjet = require('node-mailjet');
require('dotenv').config();

const mailjet = Mailjet.apiConnect(
    process.env.API_KEY || process.env.mail_api,
    process.env.SECRET_KEY || process.env.secret_key
);

module.exports = mailjet;
