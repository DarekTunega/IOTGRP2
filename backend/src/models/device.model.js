import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    default: 'sensor'
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  building: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Building', 
    required: true 
  },
  batteryLevel: {
    type: Number,
    default: 100
  },
  discordWebhook: {
    type: String,
    default: null
  },
  readings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CO2Reading'
  }]
}, { timestamps: true });

export default mongoose.model('Device', DeviceSchema);
