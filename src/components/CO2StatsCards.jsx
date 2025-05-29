import React, { useState } from 'react';
import Card from './Card';

function CO2StatsCards({ currentLevel, dailyAverage, peakValue, deviceName, deviceId, batteryLevel, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(deviceName);

  // Helper function to determine level classification and color
  const getLevelInfo = (value) => {
    if (value < 800) return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-100', borderColor: 'border-green-500' };
    if (value < 1200) return { level: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' };
    return { level: 'High', color: 'text-red-500', bgColor: 'bg-red-100', borderColor: 'border-red-500' };
  };

  // Helper function to determine air quality status based on daily average
  const getAirQualityInfo = (average) => {
    if (average < 600) {
      return {
        status: 'Excellent',
        description: 'Optimal air quality',
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-500'
      };
    } else if (average < 800) {
      return {
        status: 'Good',
        description: 'Skibidi air quality',
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-500'
      };
    } else if (average < 1000) {
      return {
        status: 'Fair',
        description: 'Moderate air quality - Consider ventilation',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-500'
      };
    } else if (average < 1200) {
      return {
        status: 'Poor',
        description: 'Poor air quality - Ventilation required',
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-500'
      };
    } else {
      return {
        status: 'Dangerous',
        description: 'Dangerous air quality - Immediate action needed',
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-500'
      };
    }
  };

  // Get current classifications
  const currentInfo = getLevelInfo(currentLevel);
  const averageInfo = getLevelInfo(dailyAverage);
  const peakInfo = getLevelInfo(peakValue);
  const airQualityInfo = getAirQualityInfo(dailyAverage);

  // Get battery color based on level
  const getBatteryColor = () => {
    if (batteryLevel > 60) return 'text-green-500';
    if (batteryLevel > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    onNameChange(deviceId, editedName);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Device Header */}
      <div className="flex justify-between items-center">
        <div>
          {isEditing ? (
            <form onSubmit={handleNameSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-xl font-bold border-b border-indigo-500 focus:outline-none focus:border-indigo-700"
                autoFocus
              />
              <button type="submit" className="text-indigo-600 hover:text-indigo-800">✓</button>
              <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{deviceName}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ✎
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500">ID: {deviceId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${getBatteryColor()}`}>
            {batteryLevel}%
          </span>
          <span className="text-2xl">
            {batteryLevel > 75 ? '🔋' : batteryLevel > 50 ? '🔋' : batteryLevel > 25 ? '🔋' : '🪫'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current CO2 Level */}
        <Card className={`${currentInfo.bgColor} border-l-4 ${currentInfo.borderColor}`}>
          <h3 className="text-lg font-medium text-gray-700">Current CO2 Level</h3>
          <div className="flex items-baseline mt-2">
            <p className={`text-3xl font-bold ${currentInfo.color}`}>{currentLevel}</p>
            <p className="ml-1 text-gray-500">ppm</p>
          </div>
          <p className={`mt-1 ${currentInfo.color} font-medium`}>{currentInfo.level} level</p>
        </Card>

        {/* Daily Average */}
        <Card className={`${averageInfo.bgColor} border-l-4 ${averageInfo.borderColor}`}>
          <h3 className="text-lg font-medium text-gray-700">Daily Average</h3>
          <div className="flex items-baseline mt-2">
            <p className={`text-3xl font-bold ${averageInfo.color}`}>{dailyAverage}</p>
            <p className="ml-1 text-gray-500">ppm</p>
          </div>
          <p className={`mt-1 ${averageInfo.color} font-medium`}>{averageInfo.level} level</p>
        </Card>

        {/* Air Quality */}
        <Card className={`${airQualityInfo.bgColor} border-l-4 ${airQualityInfo.borderColor}`}>
          <h3 className="text-lg font-medium text-gray-700">Air Quality</h3>
          <p className={`text-3xl font-bold mt-2 ${airQualityInfo.color}`}>{airQualityInfo.status}</p>
          <p className={`mt-1 ${airQualityInfo.color} font-medium`}>{airQualityInfo.description}</p>
        </Card>

        {/* Peak Value Today */}
        <Card className={`${peakInfo.bgColor} border-l-4 ${peakInfo.borderColor}`}>
          <h3 className="text-lg font-medium text-gray-700">Peak Today</h3>
          <div className="flex items-baseline mt-2">
            <p className={`text-3xl font-bold ${peakInfo.color}`}>{peakValue}</p>
            <p className="ml-1 text-gray-500">ppm</p>
          </div>
          <p className={`mt-1 ${peakInfo.color} font-medium`}>{peakInfo.level} level</p>
        </Card>
      </div>
    </div>
  );
}

export default CO2StatsCards;
