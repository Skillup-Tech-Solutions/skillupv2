const express = require('express');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/emailRoutes');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use('/api/email', emailRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
