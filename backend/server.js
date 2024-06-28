const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nutritionalInfo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema and model for nutritional information
const nutritionalInfoSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number,
  fat: Number,
  carbohydrates: Number,
});

const NutritionalInfo = mongoose.model('NutritionalInfo', nutritionalInfoSchema);

// Endpoint to store nutritional information
app.post('/api/nutritional-info', async (req, res) => {
  try {
    const nutritionalInfo = new NutritionalInfo(req.body);
    await nutritionalInfo.save();
    res.status(201).send(nutritionalInfo);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});