import Sensor from '../models/sensor.model.js';

// Add a new sensor to a building
export const addSensor = async (req, res) => {
  try {
    const { name, buildingId, deviceId } = req.body;

    if (!name || !buildingId || !deviceId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const sensor = await Sensor.create({ name, building: buildingId, deviceId });
    res.status(201).json(sensor);
  } catch (error) {
    console.error('Error adding sensor:', error);
    res.status(500).json({ message: 'Server error while adding sensor' });
  }
};

// Get all sensors for a specific building
export const getSensorsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;

    if (!buildingId) {
      return res.status(400).json({ message: 'Missing buildingId parameter' });
    }

    const sensors = await Sensor.find({ building: buildingId });
    res.status(200).json(sensors);
  } catch (error) {
    console.error('Error retrieving sensors:', error);
    res.status(500).json({ message: 'Server error while retrieving sensors' });
  }
};

// Update battery level for a sensor
export const updateBatteryLevel = async (req, res) => {
  try {
    const { batteryLevel } = req.body;

    if (typeof batteryLevel !== 'number') {
      return res.status(400).json({ message: 'Invalid battery level' });
    }

    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      { batteryLevel },
      { new: true }
    );

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    res.status(200).json({
      message: 'Battery level updated successfully',
      sensor
    });
  } catch (error) {
    console.error('Error updating battery level:', error);
    res.status(500).json({ message: 'Server error while updating battery level' });
  }
};
