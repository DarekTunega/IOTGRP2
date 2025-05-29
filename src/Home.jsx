import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import apiClient from './utils/apiClient';
import { useAuth } from './context/AuthContext';

function Home() {
  const { isLoggedIn, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const notifData = await apiClient('/notifications', 'GET', null, token);
        setNotifications(notifData);
        const buildingsData = await apiClient('/buildings', 'GET', null, token);
        setBuildings(buildingsData);
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
            <h1 className="text-3xl font-bold text-gray-900">Recent Notifications</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-8 text-lg text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : buildings.length === 0 ? (
              <Card>No buildings found.</Card>
            ) : (
              <div className="space-y-10">
                {buildings.map((building) => (
                  <div key={building._id} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800">{building.name}</h2>
                    {building.devices && building.devices.length > 0 ? (
                      building.devices.map((device) => {
                        const deviceNotifs = notifications.filter(
                          (notif) =>
                            notif.sensorId === device._id &&
                            notif.buildingId === building._id
                        );

                        return (
                          <Card key={device._id}>
                            <h3 className="text-md font-semibold mb-2">{device.name}</h3>
                            <div className="space-y-2">
                              {deviceNotifs.length > 0 ? (
                                deviceNotifs.map((notif, idx) => (
                                  <div
                                    key={notif._id || idx}
                                    className="flex justify-between items-center border-b pb-1"
                                  >
                                    <div>
                                      <p className="text-gray-800">{notif.message}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(notif.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    {notif.read ? (
                                      <span className="text-green-500 text-xs font-semibold">Read</span>
                                    ) : (
                                      <span className="text-yellow-500 text-xs font-semibold">Unread</span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">No notifications yet.</p>
                              )}
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <p className="text-gray-500">No sensors found in this building.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
