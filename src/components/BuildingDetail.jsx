import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Card from './Card';
import CO2StatsCards from './CO2StatsCards';
import CO2Graph from './Co2Graph';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

function BuildingDetail() {
  const { buildingId } = useParams();
  const { token } = useAuth();
  const [building, setBuilding] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [error, setError] = useState(null);
  const [addDeviceId, setAddDeviceId] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');

  const calculateAverage = (readings) =>
    readings && readings.length > 0
      ? Math.round(readings.reduce((sum, r) => sum + r.co2Level, 0) / readings.length)
      : 0;

  const getPeak = (readings) =>
    readings && readings.length > 0
      ? Math.max(...readings.map(r => r.co2Level))
      : 0;

  const generateAlerts = (readings) => {
    if (!readings || readings.length === 0) return [];

    const alerts = [];
    const recentReadings = readings.slice(0, 10);

    recentReadings.forEach(reading => {
      const co2Level = reading.co2Level;
      let alertData = null;

      if (co2Level >= 1200) {
        alertData = {
          level: 'Dangerous',
          message: 'Ventilate immediately - Dangerous CO2 levels!',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          severity: 'critical'
        };
      } else if (co2Level >= 800) {
        alertData = {
          level: 'Medium',
          message: 'Try to ventilate - Elevated CO2 levels',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          severity: 'warning'
        };
      }

      if (alertData) {
        alerts.push({
          ...alertData,
          co2Level,
          timestamp: reading.timestamp,
          id: `${reading.timestamp}-${co2Level}`
        });
      }
    });

    const uniqueAlerts = [];
    let lastAlert = null;

    for (const alert of alerts) {
      if (!lastAlert || lastAlert.severity !== alert.severity ||
        Math.abs(new Date(alert.timestamp) - new Date(lastAlert.timestamp)) > 30 * 60 * 1000) {
        uniqueAlerts.push(alert);
        lastAlert = alert;
      }
    }

    return uniqueAlerts.slice(0, 3);
  };

  useEffect(() => {
    if (!token || !buildingId) {
      setIsLoading(false);
      setError('Missing token or Building ID.');
      return;
    }

    const fetchBuildingDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient(`/buildings/${buildingId}`, 'GET', null, token);
        setBuilding({ id: data._id, name: data.name, userId: data.userId });
        setDevices((data.devices || []).map(d => ({ ...d, id: d._id })));
      } catch (err) {
        setError(err.message || 'Failed to fetch building details');
        setBuilding(null);
        setDevices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildingDetails();
  }, [buildingId, token]);

  const handleAddDevice = async () => {
    if (!addDeviceId.trim()) return alert('Please enter a device ID.');
    if (!token) return alert('Authentication error.');
    setError(null);
    try {
      const addedDevice = await apiClient(
        `/buildings/${buildingId}/devices`,
        'POST',
        { deviceId: addDeviceId.trim(), discordWebhook },
        token
      );
      setDevices(prev => [...prev, addedDevice]);
      setShowAddDevice(false);
      setAddDeviceId('');
    } catch (err) {
      setError(err.message || 'Failed to add device');
    }
  };

  const handleRemoveDevice = async (deviceIdToRemove) => {
    if (!token) return alert('Authentication error.');
    if (!window.confirm(`Remove device ${deviceIdToRemove}?`)) return;
    try {
      await apiClient(`/buildings/${buildingId}/devices/${deviceIdToRemove}`, 'DELETE', null, token);
      setDevices(prev => prev.filter(d => d.id !== deviceIdToRemove));
    } catch (err) {
      setError(err.message || 'Failed to remove device');
    }
  };

  const handleNameChange = async (deviceId, newName) => {
    if (!token) return alert('Authentication error.');
    const original = devices.find(d => d.id === deviceId);
    if (!original) return;
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, name: newName } : d));
    try {
      await apiClient(`/sensors/${deviceId}`, 'PATCH', { name: newName }, token);
    } catch (err) {
      setError(err.message || 'Failed to update sensor name');
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, name: original.name } : d));
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen bg-gray-100"><Navbar /><div className="ml-64 flex-1 p-6 text-center">Loading...</div></div>;
  }

  if (error && !building) {
    return <div className="flex min-h-screen bg-gray-100"><Navbar /><div className="ml-64 flex-1 p-6 text-center">Error: {error}</div></div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="ml-64 flex-1 p-6">
        <div className="mb-4">
          <Link to="/buildings" className="text-indigo-600 hover:text-indigo-800">&larr; Back</Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{building.name} - Devices</h1>
          <button onClick={() => setShowAddDevice(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+ Add Device</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">{error}</div>}

        {showAddDevice && (
          <Card className="mb-6 p-4">
            <h3 className="text-lg font-semibold mb-3">Add Device</h3>
            <input type="text" value={addDeviceId} onChange={e => setAddDeviceId(e.target.value)} placeholder="Device ID" className="px-3 py-2 border rounded mr-2" />
            <input type="text" value={discordWebhook} onChange={e => setDiscordWebhook(e.target.value)} placeholder="Discord Webhook URL (optional)" className="px-3 py-2 border rounded mr-2" />
            <button onClick={handleAddDevice} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add</button>
            <button onClick={() => setShowAddDevice(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </Card>
        )}

        <div className="space-y-8 max-w-7xl mx-auto">
          {devices.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">No devices.</Card>
          ) : (
            devices.map((device, idx) => (
              <Card key={device.id || idx} className="p-6 space-y-6">
                <CO2StatsCards
                  currentLevel={device.readings?.[0]?.co2Level || 0}
                  dailyAverage={calculateAverage(device.readings)}
                  peakValue={getPeak(device.readings)}
                  deviceName={device.name}
                  deviceId={device.id}
                  batteryLevel={device.batteryLevel ?? 0}
                  lastUpdateTime={device.readings?.[0]?.timestamp}
                  onNameChange={handleNameChange}
                />

                <div className="min-h-[350px] w-full">
                  {device.readings && device.readings.length > 0 ? (
                    <CO2Graph data={device.readings} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No reading data available for graph.
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove Device from Building
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BuildingDetail;
