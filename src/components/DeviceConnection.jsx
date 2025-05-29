import React, { useState } from 'react';
import Card from './Card';

function DeviceConnection({ onConnect }) {
  const [deviceId, setDeviceId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = () => {
    if (!deviceId) {
      setError('Please enter a device ID');
      return;
    }

    setError('');
    setIsConnecting(true);

    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      onConnect && onConnect(deviceId);
    }, 2000);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Connect Your Device</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
            Device ID
          </label>
          <input
            type="text"
            id="deviceId"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="e.g., CO2-MONITOR-001"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the ID from your CO2 monitoring device
          </p>
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isConnecting
              ? 'bg-indigo-400'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isConnecting ? 'Connecting...' : 'Connect Device'}
        </button>
      </div>
    </Card>
  );
}

export default DeviceConnection;
