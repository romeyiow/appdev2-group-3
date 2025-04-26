require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');


mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});  

app.use(cors());
app.use(express.json());
const studentRoutes = require('./routes/studentRoutes');
app.use('/students', studentRoutes);


app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 

