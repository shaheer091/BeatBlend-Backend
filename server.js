const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const userRoutes=require('./routes/userRoutes');


const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use('/user', userRoutes);

const dbURI = process.env.DATABASE;
mongoose.connect(dbURI);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
