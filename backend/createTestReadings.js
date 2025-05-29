import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Device from './src/models/device.model.js';
import CO2Reading from './src/models/reading.model.js';

// Load environment variables
dotenv.config();

// Set the device ID you want to create readings for
const DEVICE_ID = '303947013139353611000000';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for reading creation');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Generate realistic CO2 readings for the last 24 hours
const generateReadings = (deviceObjectId) => {
  const readings = [];
  const now = new Date();
  const hoursToGenerate = 24;
  const readingsPerHour = 4; // Every 15 minutes

  for (let hour = hoursToGenerate; hour >= 0; hour--) {
    for (let reading = 0; reading < readingsPerHour; reading++) {
      const timestamp = new Date(now - (hour * 60 * 60 * 1000) - (reading * 15 * 60 * 1000));

      // Generate realistic CO2 levels based on time of day
      let baseCO2;
      const hourOfDay = timestamp.getHours();

      if (hourOfDay >= 6 && hourOfDay <= 22) {
        // Daytime - higher CO2 levels (people activity)
        baseCO2 = 600 + Math.random() * 400; // 600-1000 ppm

        // Add occasional spikes during work hours
        if (hourOfDay >= 9 && hourOfDay <= 17 && Math.random() < 0.2) {
          baseCO2 += Math.random() * 400; // Spike up to 1400 ppm
        }
      } else {
        // Nighttime - lower CO2 levels
        baseCO2 = 400 + Math.random() * 200; // 400-600 ppm
      }

      // Add some random variation
      baseCO2 += (Math.random() - 0.5) * 100;

      // Ensure minimum value
      baseCO2 = Math.max(350, Math.round(baseCO2));

      readings.push({
        device: deviceObjectId,
        co2Level: baseCO2,
        timestamp: timestamp
      });
    }
  }

  return readings;
};

const createTestReadings = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find the device by deviceId
    const device = await Device.findOne({ deviceId: DEVICE_ID });
    if (!device) {
      console.log(`❌ Device with ID ${DEVICE_ID} not found!`);
      console.log('Make sure you run createTestDevice.js first.');
      process.exit(1);
    }

    console.log(`📱 Found device: ${device.name} (${device.deviceId})`);

    // Check if readings already exist
    const existingReadings = await CO2Reading.find({ device: device._id });
    if (existingReadings.length > 0) {
      console.log(`⚠️  Device already has ${existingReadings.length} readings.`);
      console.log('Do you want to delete existing readings and create new ones? (Ctrl+C to cancel)');

      // Delete existing readings
      await CO2Reading.deleteMany({ device: device._id });
      console.log('🗑️  Deleted existing readings.');
    }

    // Generate test readings
    console.log('📊 Generating test readings for the last 24 hours...');
    const testReadings = generateReadings(device._id);

    // Insert readings in batches
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < testReadings.length; i += batchSize) {
      const batch = testReadings.slice(i, i + batchSize);
      await CO2Reading.insertMany(batch);
      totalInserted += batch.length;
      console.log(`✅ Inserted ${totalInserted}/${testReadings.length} readings...`);
    }

    console.log(`🎉 Successfully created ${totalInserted} test readings for device ${DEVICE_ID}!`);

    // Show some sample readings
    const latestReadings = await CO2Reading.find({ device: device._id })
      .sort({ timestamp: -1 })
      .limit(5);

    console.log('\n📈 Latest 5 readings:');
    latestReadings.forEach(reading => {
      console.log(`   ${reading.timestamp.toISOString()}: ${reading.co2Level} ppm`);
    });

  } catch (error) {
    console.error('❌ Error creating test readings:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n✅ MongoDB disconnected');
  }
};

// Run the function
createTestReadings();
