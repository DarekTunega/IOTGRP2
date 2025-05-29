import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Device from './src/models/device.model.js';

// Load environment variables
dotenv.config();

// Current device ID in database
const CURRENT_DB_DEVICE_ID = '303947013139353611000000';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const updateDeviceId = async () => {
  try {
    await connectDB();

    // Find the current device
    const device = await Device.findOne({ deviceId: CURRENT_DB_DEVICE_ID });
    if (!device) {
      console.log(`❌ Device with ID ${CURRENT_DB_DEVICE_ID} not found!`);
      process.exit(1);
    }

    console.log(`📱 Found device: ${device.name}`);
    console.log(`🔧 Current device ID: ${device.deviceId}`);
    console.log('\n' + '='.repeat(50));
    console.log('OPTIONS:');
    console.log('1. Your hardware device is sending the actual hardware ID');
    console.log('2. Your Node-RED might be using the fallback "co2-sensor-001"');
    console.log('='.repeat(50));

    // Check if there's already a device with the fallback ID
    const fallbackDevice = await Device.findOne({ deviceId: 'co2-sensor-001' });
    if (fallbackDevice) {
      console.log('\n⚠️  WARNING: A device with ID "co2-sensor-001" already exists!');
      console.log('This might be the device that\'s receiving data.');
      console.log(`Device name: ${fallbackDevice.name}`);
    }

    console.log('\n📋 To fix this issue, you have these options:');
    console.log('\n1️⃣  UPDATE DATABASE TO MATCH YOUR HARDWARE:');
    console.log('   - Check your Node-RED debug logs for the actual device ID being sent');
    console.log('   - Then run this script again with the real device ID');

    console.log('\n2️⃣  UPDATE YOUR HARDWARE TO MATCH DATABASE:');
    console.log('   - Modify your firmware to use a fixed device ID');
    console.log('   - Or update Node-RED to force use your database device ID');

    console.log('\n3️⃣  CHECK NODE-RED LOGS:');
    console.log('   - Look at Node-RED debug output to see what device ID is being sent');
    console.log('   - The "Debug Raw Data" and "Debug Formatted Data" nodes will show this');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB disconnected');
  }
};

// Run the function
updateDeviceId();
