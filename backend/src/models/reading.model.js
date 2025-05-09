import mongoose from 'mongoose';

const CO2ReadingSchema = new mongoose.Schema({
  // Reference to the device that recorded the reading
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },

  // CO₂ concentration in parts per million (ppm)
  co2Level: { type: Number, required: true },

  // Time when the reading was captured
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('CO2Reading', CO2ReadingSchema);
