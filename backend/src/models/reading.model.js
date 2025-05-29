import mongoose from 'mongoose';

const CO2ReadingSchema = new mongoose.Schema({
  sensor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  co2Level: { type: Number, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // 30 dní v sekundách
  }
});

export default mongoose.model('CO2Reading', CO2ReadingSchema);
