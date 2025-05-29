// Configuration for mock data generation
export const config = {
  // Device configurations
  devices: {
    'DEVICE_001': {
      id: 'DEVICE_001',
      name: 'CO2 Sensor - Room 101',
      batteryLevel: 85,
      // Reading configuration - Low CO2 levels
      readings: {
        normal: {
          min: 400,
          max: 600
        },
        spike: {
          probability: 0.1,  // 10% chance of spike
          min: 700,
          max: 800
        }
      }
    },
    'DEVICE_002': {
      id: 'DEVICE_002',
      name: 'CO2 Sensor - Room 102',
      batteryLevel: 92,
      // Reading configuration - Medium CO2 levels
      readings: {
        normal: {
          min: 800,
          max: 1000
        },
        spike: {
          probability: 0.3,  // 30% chance of spike
          min: 1000,
          max: 1200
        }
      }
    },
    'DEVICE_003': {
      id: 'DEVICE_003',
      name: 'CO2 Sensor - Room 103',
      batteryLevel: 78,
      // Reading configuration - High CO2 levels
      readings: {
        normal: {
          min: 1200,
          max: 1400
        },
        spike: {
          probability: 0.5,  // 50% chance of spike
          min: 1400,
          max: 1600
        }
      }
    }
  },

  // General settings
  settings: {
    // Time settings
    timeInterval: 15,  // minutes between readings
    numberOfReadings: 96,  // 24 hours of readings
    batteryLevel: {
      min: 70,
      max: 100
    }
  }
};

// Helper function to check if current time is within work hours
export function isWorkHours(hour, start, end) {
  return hour >= start && hour <= end;
}

// Helper function to get random number in range
export function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to check probability
export function checkProbability(probability) {
  return Math.random() < probability;
}
