// Generate mock CO2 readings for the last 24 hours
export const generateMockData = (hours = 24) => {
  const now = new Date();
  const data = [];

  // Generate data points for the last 24 hours (hourly data)
  for (let i = 24; i >= 0; i--) {
    // Base CO2 level between 400-700
    let baseCO2 = 400 + Math.random() * 300;

    // Add time-based variations (higher during work hours)
    const hour = (now.getHours() - i + 24) % 24;
    if (hour >= 9 && hour <= 17) {
      baseCO2 += Math.random() * 400; // Higher during work hours
    }

    // Occasionally add spikes
    if (Math.random() < 0.2) {
      baseCO2 += Math.random() * 500;
    }

    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - i);

    data.push({
      timestamp,
      value: Math.round(baseCO2),
    });
  }

  return data;
};

// Get current CO2 level
export const getCurrentCO2Level = (data) => {
  return data[data.length - 1]?.value || 0;
};

// Calculate daily average
export const getDailyAverage = (data) => {
  const sum = data.reduce((acc, point) => acc + point.value, 0);
  return Math.round(sum / data.length);
};

// Get peak value
export const getPeakValue = (data) => {
  return Math.max(...data.map(point => point.value));
};

// Mock device connection status
export const getDeviceStatus = () => {
  // Simulate 90% chance the device is connected
  return Math.random() < 0.9 ? 'connected' : 'disconnected';
};

export const getConnectedDeviceInfo = (deviceId) => {
	return {
	  id: deviceId || 'CO2-SENSOR-001',
	  name: 'CO2 Monitor',
	  model: 'CM-2023',
	  batteryLevel: Math.floor(Math.random() * 100), // Random battery level between 0-100
	  signalStrength: Math.floor(Math.random() * 5) + 1, // 1-5 signal bars
	  lastSync: new Date().toISOString(),
	  firmware: 'v1.2.3',
	  isActive: true
	};
  };
