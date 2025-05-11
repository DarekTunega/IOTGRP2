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


  useEffect(() => {
  console.log("🏠 BuildingDetail mounted with ID:", buildingId);
}, []);

  const calculateAverage = (readings) =>
    readings && readings.length > 0
      ? Math.round(readings.reduce((sum, r) => sum + r.co2Level, 0) / readings.length)
      : 0;

  const getPeak = (readings) =>
    readings && readings.length > 0
      ? Math.max(...readings.map(r => r.co2Level))
      : 0;

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
          console.log("📦 DATA FROM BACKEND:", data);
          console.log("📡 DEVICE 0:", JSON.stringify(data.devices?.[0], null, 2));

        setBuilding({ id: data._id, name: data.name, userId: data.userId });
        setDevices((data.devices || []).map(d => ({
          ...d,
          id: d._id
        })));
      } catch (err) {
        console.error("Failed to fetch building details:", err);
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
    if (!addDeviceId.trim()) {
      alert('Please enter a device ID.');
      return;
    }
    if (!token) {
      alert('Authentication error.');
      return;
    }
    setError(null);
    try {
     const addedDevice = await apiClient(
  `/buildings/${buildingId}/devices`,
  'POST',
  { deviceId: addDeviceId.trim(), discordWebhook },
  token
);

      setDevices(prevDevices => {
        if (prevDevices.some(d => d.id === addedDevice.id)) {
          return prevDevices;
        }
        return [...prevDevices, addedDevice];
      });
      setShowAddDevice(false);
      setAddDeviceId('');
    } catch (err) {
      console.error("Failed to add device:", err);
      setError(err.message || 'Failed to add device');
    }
  };

  const handleRemoveDevice = async (deviceIdToRemove) => {
    if (!token) {
      alert('Authentication error.');
      return;
    }
    setError(null);
    if (!window.confirm(`Are you sure you want to remove device ${deviceIdToRemove} from this building?`)) return;

    try {
      await apiClient(`/buildings/${buildingId}/devices/${deviceIdToRemove}`, 'DELETE', null, token);
      setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceIdToRemove));
    } catch (err) {
      console.error("Failed to remove device:", err);
      setError(err.message || 'Failed to remove device');
    }
  };

  const handleNameChange = async (deviceId, newName) => {
    if (!token) {
      alert('Authentication error.');
      return;
    }
    const originalDevice = devices.find(d => d.id === deviceId);
    if (!originalDevice) return;
    const originalName = originalDevice.name;
    setError(null);

    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId ? { ...device, name: newName } : device
      )
    );

    try {
      await apiClient(`/devices/${deviceId}`, 'PATCH', { name: newName }, token);
      console.log(`Updated name for ${deviceId} to ${newName} via API`);
    } catch (err) {
      console.error("Failed to update device name:", err);
      setError(err.message || 'Failed to update device name');
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId ? { ...device, name: originalName } : device
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Navbar />
        <div className="ml-64 flex-1 p-6 text-center">Loading building details...</div>
      </div>
    );
  }

  if (error && !building) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Navbar />
        <div className="ml-64 flex-1 p-6 text-center">
          <h1 className="text-xl text-red-600">Error: {error}</h1>
          <Link to="/buildings" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            &larr; Back to Buildings
          </Link>
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Navbar />
        <div className="ml-64 flex-1 p-6 text-center">
          Building not found or unable to load details.
          <Link to="/buildings" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            &larr; Back to Buildings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="ml-64 flex-1 p-6">
        <div className="mb-4">
          <Link to="/buildings" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to Buildings
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{building.name} - Devices</h1>
          <button
            onClick={() => { setShowAddDevice(true); setError(null); }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <span className="text-xl mr-2">+</span>
            Add Device
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">Action Error: {error}</div>}

        {showAddDevice && (
          <Card className="mb-6 p-4">
            <h3 className="text-lg font-semibold mb-3">Add Existing Device by ID</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={addDeviceId}
                onChange={(e) => setAddDeviceId(e.target.value)}
                placeholder="Enter Device ID (e.g., CO2-MONITOR-001)"
                id="newDeviceId"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="Enter Discord Webhook URL (optional)"
                className="flex-grow px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                onClick={handleAddDevice}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add to Building
              </button>
              <button
                onClick={() => { setShowAddDevice(false); setError(null); setAddDeviceId(''); }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </Card>
        )}

        <div className="space-y-8 max-w-7xl mx-auto">
          {devices.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No devices currently assigned to this building. Use the 'Add Device' button to assign one.
            </Card>
          ) : (
            devices.map((device, index) => {
  if (!device) return null; // ⛑ ochrana pred crashom
  return (
                <Card key={device.id || index} className="p-6 space-y-6">
                <CO2StatsCards
                  currentLevel={device.readings?.[0]?.co2Level || 0}
                  dailyAverage={calculateAverage(device.readings)}
                  peakValue={getPeak(device.readings)}
                  deviceName={device.name}
                  deviceId={device.id}
                  batteryLevel={device.batteryLevel ?? 0}
                  onNameChange={handleNameChange}
                />
                <div className="h-[350px]">
                  {device.readings && device.readings.length > 0 ? (
                    <CO2Graph data={device.readings} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No reading data available for graph.
                    </div>
                  )}
                </div>
                <div className="flex justify-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove Device from Building
                  </button>
                </div>
              </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default BuildingDetail;
