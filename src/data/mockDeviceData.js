import { config, getRandomInRange, checkProbability } from './mockDataConfig';

// Mock data for CO2 measuring devices
const mockDevices = {};

// Generate readings based on device configuration
function generateReadings(deviceConfig) {
  const readings = [];
  const now = new Date();
  const { timeInterval, numberOfReadings, batteryLevel } = config.settings;

  for (let i = numberOfReadings; i >= 0; i--) {
    const timestamp = new Date(now - (i * timeInterval * 60 * 1000));
    let co2Level;

    // Generate CO2 level based on device configuration
    if (checkProbability(deviceConfig.readings.spike.probability)) {
      co2Level = getRandomInRange(
        deviceConfig.readings.spike.min,
        deviceConfig.readings.spike.max
      );
    } else {
      co2Level = getRandomInRange(
        deviceConfig.readings.normal.min,
        deviceConfig.readings.normal.max
      );
    }

    const reading = {
      timestamp: timestamp.toISOString(),
      co2Level: co2Level,
      batteryLevel: getRandomInRange(batteryLevel.min, batteryLevel.max)
    };
    readings.push(reading);
  }

  return readings;
}

// Initialize mock devices
Object.entries(config.devices).forEach(([deviceId, deviceConfig]) => {
  mockDevices[deviceId] = {
    ...deviceConfig,
    readings: generateReadings(deviceConfig),
    lastUpdated: new Date().toISOString()
  };
});

export function getDeviceData(deviceId) {
  if (!mockDevices[deviceId]) {
    throw new Error(`Device with ID ${deviceId} not found`);
  }
  return mockDevices[deviceId];
}

export function getAllDevices() {
  return Object.values(mockDevices);
}

export default mockDevices;
