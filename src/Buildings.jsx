import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import { Link } from 'react-router-dom';
import apiClient from './utils/apiClient';
import { useAuth } from './context/AuthContext';

function Buildings() {
  const { token } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBuildingName, setNewBuildingName] = useState('');
  const [isAddingBuilding, setIsAddingBuilding] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError('Please log in to view buildings.');
      return;
    }

    const fetchBuildings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient('/buildings', 'GET', null, token);
        setBuildings(data);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch buildings:", err);
        setError(err.message || 'Failed to fetch buildings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildings();
  }, [token]);

  const handleAddBuilding = async () => {
    if (!newBuildingName.trim()) {
      alert('Please enter a building name.');
      return;
    }
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }

    setError(null);
    try {
      const newBuilding = await apiClient('/buildings', 'POST', { name: newBuildingName.trim() }, token);
      setBuildings(prevBuildings => [...prevBuildings, newBuilding]);
      setNewBuildingName('');
      setIsAddingBuilding(false);
    } catch (err) {
      console.error("Failed to add building:", err);
      setError(err.message || 'Failed to add building');
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    if (!window.confirm('Are you sure you want to delete this building?')) return;
    try {
      await apiClient(`/buildings/${buildingId}`, 'DELETE', null, token);
      setBuildings((prev) => prev.filter(b => b._id !== buildingId));
    } catch (err) {
      console.error('Failed to delete building:', err);
      alert('Error deleting building');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="ml-64 flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Buildings</h1>
          <button
            onClick={() => setIsAddingBuilding(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
            disabled={isAddingBuilding}
          >
            <span className="text-xl mr-2">+</span>
            Create Building
          </button>
        </div>

        {isAddingBuilding && (
          <Card className="mb-6 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                placeholder="Enter new building name"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                autoFocus
              />
              <button
                onClick={handleAddBuilding}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add
              </button>
              <button
                onClick={() => { setIsAddingBuilding(false); setError(null); }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </Card>
        )}

        {isLoading && <div className="text-center py-4">Loading buildings...</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">Error: {error}</div>}

        {!isLoading && !error && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {buildings.length === 0 && !isAddingBuilding ? (
              <p className="text-center text-gray-500">No buildings found. Click 'Create Building' to add one.</p>
            ) : (
              buildings.map(building => (
                <Card key={building._id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <Link to={`/buildings/${building._id}`} className="block">
                      <h2 className="text-xl font-semibold text-indigo-800">{building.name}</h2>
                      <span className="text-sm text-gray-500">View Devices →</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteBuilding(building._id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Buildings;
