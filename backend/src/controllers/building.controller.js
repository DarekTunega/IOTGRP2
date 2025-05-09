import Building from '../models/building.model.js';
import Device from '../models/device.model.js';
import Sensor from '../models/sensor.model.js';

// Mock data for testing
const MOCK_BUILDINGS = [
  {
    id: 'building1',
    name: 'Main Building',
    createdBy: 'test_user_id',
    createdAt: new Date().toISOString()
  },
  {
    id: 'building2',
    name: 'Secondary Building',
    createdBy: 'test_user_id',
    createdAt: new Date().toISOString()
  }
];

// Create a building
export const createBuilding = async (req, res) => {
  try {
    if (req.user && req.user.id === 'test_user_id') {
      const { name } = req.body;
      const newBuilding = {
        id: `building${Date.now()}`,
        name,
        createdBy: 'test_user_id',
        createdAt: new Date().toISOString()
      };

      return res.status(201).json(newBuilding);
    }

    const { name } = req.body;
    const building = await Building.create({ name, createdBy: req.user.id });
    res.status(201).json(building);
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all buildings
export const getBuildings = async (req, res) => {
  try {
    if (req.user && req.user.id === 'test_user_id') {
      return res.status(200).json(MOCK_BUILDINGS);
    }

    const buildings = await Building.find({ createdBy: req.user.id });
    res.status(200).json(buildings);
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get building by ID + compute stats
export const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id).populate({
      path: 'devices',
      populate: {
        path: 'readings',
        options: { sort: { timestamp: -1 }, limit: 50 }
      }
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Add stats to each device
    building.devices = building.devices.map(device => {
      const readings = device.readings || [];

      const current = readings[0]?.co2Level ?? 0;
      const co2Values = readings.map(r => r.co2Level);
      const average = co2Values.length > 0
        ? Math.round(co2Values.reduce((a, b) => a + b, 0) / co2Values.length)
        : 0;
      const peak = co2Values.length > 0 ? Math.max(...co2Values) : 0;

      return {
        ...device.toObject(),
        stats: { current, average, peak }
      };
    });

    res.status(200).json(building);
  } catch (error) {
    console.error('Get building by ID error:', error);
    res.status(500).json({ message: 'Server error while retrieving building' });
  }
};


// Delete a building
export const deleteBuilding = async (req, res) => {
  try {
    await Building.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Building successfully deleted' });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ message: 'Server error while deleting building' });
  }
};

// Add a device to a building
export const addDeviceToBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId } = req.body;

    if (!deviceId) return res.status(400).json({ message: 'Device ID is required' });

    const building = await Building.findById(id);
    if (!building) return res.status(404).json({ message: 'Building not found' });

    let device = await Device.findOne({ deviceId });

    if (!device) {
      const sensor = await Sensor.findOne({ deviceId });
      device = await Device.create({
        name: sensor ? `CO2 Sensor ${deviceId.slice(-4)}` : `New Device ${deviceId.slice(-4)}`,
        type: 'sensor',
        deviceId,
        building: id,
        batteryLevel: sensor?.batteryLevel || 100
      });
    } else {
      device.building = id;
      await device.save();
    }

    if (!building.devices.includes(device._id)) {
      building.devices.push(device._id);
      await building.save();
    }

    res.status(200).json(device);
  } catch (error) {
    console.error('Add device to building error:', error);
    res.status(500).json({ message: 'Server error while adding device to building' });
  }
};

// Remove a device from a building
export const removeDeviceFromBuilding = async (req, res) => {
  try {
    const { id, deviceId } = req.params;

    const building = await Building.findById(id);
    if (!building) return res.status(404).json({ message: 'Building not found' });

    building.devices = building.devices.filter(device => device.toString() !== deviceId);
    await building.save();

    res.status(200).json({ message: 'Device removed from building' });
  } catch (error) {
    console.error('Remove device from building error:', error);
    res.status(500).json({ message: 'Server error while removing device from building' });
  }
};
