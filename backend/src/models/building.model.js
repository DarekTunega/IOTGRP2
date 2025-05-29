import mongoose from 'mongoose';

const BuildingSchema = new mongoose.Schema({
  // Name of the building
  name: { type: String, required: true },

  // Reference to the user who created the building
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Array of devices installed in the building
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
}, { timestamps: true });

export default mongoose.model('Building', BuildingSchema);
