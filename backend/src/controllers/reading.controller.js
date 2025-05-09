import CO2Reading from '../models/reading.model.js';
import Device from '../models/device.model.js';

// Add a new CO₂ reading
export const addCO2Reading = async (req, res) => {
  try {
    const { deviceId, co2Level } = req.body;

    if (!deviceId || typeof co2Level !== 'number') {
      return res.status(400).json({ message: 'Missing or invalid deviceId or co2Level' });
    }

    const newReading = await CO2Reading.create({ device: deviceId, co2Level });

    res.status(201).json(newReading);
  } catch (error) {
    console.error('Error saving CO₂ reading:', error);
    res.status(500).json({ message: 'Server error while saving CO₂ reading' });
  }
};

// Get last 24 hours of readings for a specific device
export const getRecentReadings = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ message: 'Missing deviceId parameter' });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const readings = await CO2Reading.find({
      device: deviceId,
      timestamp: { $gte: twentyFourHoursAgo }
    }).sort({ timestamp: 1 });

    res.status(200).json(readings);
  } catch (error) {
    console.error('Error retrieving CO₂ readings:', error);
    res.status(500).json({ message: 'Server error while retrieving CO₂ readings' });
  }
};

// Receive data from IoT gateway (e.g. Node-RED)
export const receiveGatewayData = async (req, res) => {
  try {
    const { deviceId, co2_ppm, battery_percent, timestamp } = req.body;

    if (!deviceId || typeof co2_ppm !== 'number') {
      return res.status(400).json({ message: 'Invalid or missing deviceId or co2_ppm' });
    }

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        message: 'Device not found with provided deviceId',
        received: req.body // remove in production
      });
    }

    // Optionally update battery level
    if (typeof battery_percent === 'number') {
      device.battery = battery_percent;
      await device.save();
    }

    // Create a new CO2 reading
    const reading = await CO2Reading.create({
      device: device._id,
      co2Level: co2_ppm,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.status(201).json({ message: 'Data received and stored', reading });
  } catch (error) {
    console.error('Error processing gateway data:', error);
    res.status(500).json({ message: 'Server error while receiving data' });
  }
};
