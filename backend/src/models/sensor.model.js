import mongoose from 'mongoose';

const SensorSchema = new mongoose.Schema({
  // Name of the sensor (e.g., "CO2 Sensor A1")
  name: { type: String, required: true },

  // Reference to the building the sensor belongs to
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },

  // Unique device identifier (e.g., hardware ID)
  deviceId: { type: String, unique: true, required: true },

  // Battery level in percentage
  batteryLevel: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model('Sensor', SensorSchema);
