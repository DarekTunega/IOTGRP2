import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import apiClient from './utils/apiClient';
import { useAuth } from './context/AuthContext';

function Home() {
  const { isLoggedIn, token } = useAuth();
  const [allAlerts, setAllAlerts] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0, buildings: 0, devices: 0 });

  const generateAlerts = (readings, deviceName, buildingName) => {
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
          co2Level: co2Level,
          timestamp: reading.timestamp,
          deviceName,
          buildingName,
          id: `${reading.timestamp}-${co2Level}-${deviceName}`
        });
      }
    });

    const uniqueAlerts = [];
    let lastAlert = null;

    for (const alert of alerts) {
      if (!lastAlert || lastAlert.severity !== alert.severity ||
          Math.abs(new Date(alert.timestamp) - new Date(lastAlert.timestamp)) > 15 * 60 * 1000) {
        uniqueAlerts.push(alert);
        lastAlert = alert;
      }
    }

    return uniqueAlerts.slice(0, 5);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const buildingsListData = await apiClient('/buildings', 'GET', null, token);

        const buildingsWithDetails = await Promise.all(
          buildingsListData.map(async (building) => {
            try {
              const detailedBuilding = await apiClient(`/buildings/${building._id}`, 'GET', null, token);
              return detailedBuilding;
            } catch (err) {
              console.error(`Failed to fetch details for building ${building._id}:`, err);
              return { ...building, devices: [] };
            }
          })
        );

        setBuildings(buildingsWithDetails);
        console.log("🏠 All Buildings with Details:", buildingsWithDetails);

        const allAlertsFromDevices = [];
        let totalDevices = 0;
        let criticalCount = 0;
        let warningCount = 0;

        buildingsWithDetails.forEach(building => {
          console.log(`🏢 Processing building: ${building.name}`, building.devices?.length || 0, 'devices');
          if (building.devices && building.devices.length > 0) {
            building.devices.forEach(device => {
              console.log(`📱 Processing device: ${device.name}`, device.readings?.length || 0, 'readings');
              totalDevices++;
              const deviceAlerts = generateAlerts(device.readings, device.name, building.name);
              console.log(`🚨 Generated ${deviceAlerts.length} alerts for ${device.name}`);
              allAlertsFromDevices.push(...deviceAlerts);

              deviceAlerts.forEach(alert => {
                if (alert.severity === 'critical') criticalCount++;
                if (alert.severity === 'warning') warningCount++;
              });
            });
          }
        });

        console.log(`📊 Total alerts generated: ${allAlertsFromDevices.length}`);

        allAlertsFromDevices.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setAllAlerts(allAlertsFromDevices);
        setStats({
          total: allAlertsFromDevices.length,
          critical: criticalCount,
          warning: warningCount,
          buildings: buildingsWithDetails.length,
          devices: totalDevices
        });

      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, token]);

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Navbar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome!</h2>
            <p className="text-center text-gray-600">Please log in to view your notifications and devices.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="ml-64 flex-1">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">🚨 All Alerts Dashboard</h1>
            <p className="text-gray-600 mt-2">Centralized view of all CO2 alerts across your buildings</p>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-8 text-lg text-gray-500">Loading alerts...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="bg-blue-50 border-l-4 border-blue-500">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total Alerts</p>
                    </div>
                  </Card>
                  <Card className="bg-red-50 border-l-4 border-red-500">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                      <p className="text-sm text-gray-600">Critical</p>
                    </div>
                  </Card>
                  <Card className="bg-yellow-50 border-l-4 border-yellow-500">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                      <p className="text-sm text-gray-600">Warnings</p>
                    </div>
                  </Card>
                  <Card className="bg-green-50 border-l-4 border-green-500">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.buildings}</p>
                      <p className="text-sm text-gray-600">Buildings</p>
                    </div>
                  </Card>
                  <Card className="bg-purple-50 border-l-4 border-purple-500">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{stats.devices}</p>
                      <p className="text-sm text-gray-600">Devices</p>
                    </div>
                  </Card>
                </div>

                {/* Alerts List */}
                {allAlerts.length === 0 ? (
                  <Card className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">All Clear!</h3>
                    <p className="text-gray-600">No CO2 alerts detected across all your devices.</p>
                    <p className="text-sm text-gray-500 mt-2">Air quality is acceptable in all monitored areas.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <span className="mr-2">📋</span>
                      Recent Alerts ({allAlerts.length})
                    </h2>
                    {allAlerts.map((alert, index) => (
                      <Card key={alert.id || index} className={`${alert.bgColor} border-l-4 ${alert.borderColor}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-bold ${alert.color}`}>
                                {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.level}
                              </span>
                              <span className="text-lg font-bold text-gray-800">{alert.co2Level} ppm</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📍 <strong>{alert.buildingName}</strong> → {alert.deviceName}</span>
                              <span>🕐 {new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
