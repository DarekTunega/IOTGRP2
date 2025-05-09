import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Device from '../models/device.model.js';
import Building from '../models/building.model.js';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

// Set the device ID you want to use
const DEVICE_ID = '303947013139353611000000'; 

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for device creation');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createDevice = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find or create a test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('Creating test user...');
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    }
    
    // Find or create a building
    let building = await Building.findOne({ name: 'Test Building' });
    if (!building) {
      console.log('Creating test building...');
      building = await Building.create({
        name: 'Test Building',
        createdBy: user._id
      });
    }

    // Check if device already exists
    const existingDevice = await Device.findOne({ deviceId: DEVICE_ID });
    if (existingDevice) {
      console.log(`Device with ID ${DEVICE_ID} already exists!`);
      console.log('Device details:', existingDevice);
      process.exit(0);
    }

    // Create the device
    const device = await Device.create({
      name: 'CO2 Sensor Hardware',
      type: 'sensor',
      deviceId: DEVICE_ID,
      building: building._id,
      batteryLevel: 100
    });

    // Add device to building if not already added
    if (!building.devices.includes(device._id)) {
      building.devices.push(device._id);
      await building.save();
    }

    console.log(`✅ Device created successfully with ID: ${DEVICE_ID}`);
    console.log('Device details:', device);
    console.log('Building details:', building);

  } catch (error) {
    console.error('❌ Error creating device:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

// Run the function
createDevice(); 