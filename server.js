const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const commonRoutes = require('./routes/commonRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.use('/', commonRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

const dbURI = process.env.DATABASE;
mongoose.connect(dbURI);
mongoose.connection.on('connected', () => {
  console.log('Database connected');
});

mongoose.connection.on('error', (err) => {
  console.error(`Database connection error: ${err}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
