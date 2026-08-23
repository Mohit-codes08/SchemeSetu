const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  income: { type: Number, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true }, // SC/ST/OBC/General
  businessType: { type: String, required: true },
  language: { type: String, default: "en" }, // en or hi
  matchedSchemes: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);