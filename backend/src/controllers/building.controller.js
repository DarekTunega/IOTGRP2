import Building from '../models/building.model.js';
import Device from '../models/device.model.js';
import Sensor from '../models/sensor.model.js';
import CO2Reading from '../models/reading.model.js';

export const createBuilding = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.user.id;
    const building = await Building.create({ name, createdBy });
    res.status(201).json(building);
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({ createdBy: req.user.id }).populate('devices');
    res.status(200).json(buildings);
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id).populate('devices');

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const devicesWithReadings = await Promise.all(
      building.devices.map(async (device) => {
        const readings = await CO2Reading.find({ device: device._id })
          .sort({ timestamp: -1 })
          .limit(50);
        return {
          ...device.toObject(),
          readings
        };
      })
    );

    res.status(200).json({
      ...building.toObject(),
      devices: devicesWithReadings
    });
  } catch (error) {
    console.error('Get building by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.status(200).json({ message: 'Building deleted' });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addDeviceToBuilding = async (req, res) => {
  try {
    const { deviceId, discordWebhook } = req.body;
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    if (!building.devices.includes(deviceId)) {
      building.devices.push(deviceId);
      await building.save();
    }

    const device = await Device.findOne({ deviceId }); // ⛏ použijeme tvoje vlastné ID

if (!device) {
  return res.status(404).json({ message: 'Device not found with given deviceId' });
}

if (!building.devices.includes(device._id)) {
  building.devices.push(device._id);
  await building.save();
}

if (discordWebhook) {
  device.discordWebhook = discordWebhook;
  await device.save();
}

    res.status(200).json(device);
  } catch (error) {
    console.error('Add device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeDeviceFromBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    building.devices = building.devices.filter(
      (deviceId) => deviceId.toString() !== req.params.deviceId
    );
    await building.save();

    res.status(200).json({ message: 'Device removed from building' });
  } catch (error) {
    console.error('Remove device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
