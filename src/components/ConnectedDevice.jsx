import React from 'react';
import Card from './Card';
import { getDeviceData } from '../data/mockDeviceData';

function ConnectedDevice({ isConnected, deviceId, co2Data, onDisconnect }) {
  const device = getDeviceData(deviceId);

  // Get appropriate color for battery level
  const getBatteryColor = () => {
    if (device.batteryLevel > 60) return 'text-green-500';
    if (device.batteryLevel > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Battery icon based on level
  const getBatteryIcon = () => {
    if (device.batteryLevel > 75) return '🔋';
    if (device.batteryLevel > 50) return '🔋';
    if (device.batteryLevel > 25) return '🔋';
    return '🪫';
  };

  // Generate alerts based on CO2 levels
  const generateAlerts = () => {
    const alerts = [];
    const lastReadings = co2Data.slice(-5); // Get last 5 readings

    lastReadings.forEach(reading => {
      if (reading.co2Level > 1200) {
        alerts.push({
          timestamp: new Date(reading.timestamp),
          level: 'High',
          value: reading.co2Level,
          severity: 'critical'
        });
      } else if (reading.co2Level > 800) {
        alerts.push({
          timestamp: new Date(reading.timestamp),
          level: 'Medium',
          value: reading.co2Level,
          severity: 'warning'
        });
      }
    });

    return alerts;
  };

  const alerts = generateAlerts();

  if (!isConnected || !device) {
    return null;
  }

  return (
    <Card title="Connected Device" className="mb-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{device.name}</h3>
            <p className="text-sm text-gray-500">ID: {device.id}</p>
          </div>
          <div className="bg-green-100 px-2 py-1 rounded-full text-xs font-medium text-green-800">
            Connected
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-gray-500">Battery</p>
            <p className={`font-medium flex items-center ${getBatteryColor()}`}>
              <span className="mr-1">{getBatteryIcon()}</span>
              {device.batteryLevel}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Sync</p>
            <p className="font-medium">
              {new Date(device.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div className="pt-3 border-t mt-2">
          <h4 className="text-sm font-medium mb-2">Recent Alerts</h4>
          <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {alerts.length > 0 ? (
              <ul className="space-y-2">
                {alerts.map((alert, index) => (
                  <li
                    key={index}
                    className={`text-sm border-l-2 pl-2 py-1 ${
                      alert.severity === 'critical' ? 'border-red-500' : 'border-yellow-500'
                    }`}
                  >
                    <p className={`font-medium ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {alert.level} CO2: {alert.value} ppm
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent alerts</p>
            )}
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={onDisconnect}
          className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Disconnect Device
        </button>
      </div>
    </Card>
  );
}

export default ConnectedDevice;
