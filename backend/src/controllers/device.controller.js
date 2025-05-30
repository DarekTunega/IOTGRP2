import Device from '../models/device.model.js';
import Building from '../models/building.model.js';
import CO2Reading from '../models/reading.model.js';

export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find().populate('building');
    res.status(200).json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id).populate('building');

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const readings = await CO2Reading.find({ device: device._id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      ...device.toObject(),
      readings
    });
  } catch (error) {
    console.error('Get device by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDevice = async (req, res) => {
  try {
    const { name, type, deviceId, building, batteryLevel, discordWebhook } = req.body;

    const device = await Device.create({
      name,
      type: type || 'sensor',
      deviceId,
      building,
      batteryLevel: batteryLevel || 100,
      discordWebhook
    });

    // Add device to building's devices array
    if (building) {
      await Building.findByIdAndUpdate(
        building,
        { $push: { devices: device._id } }
      );
    }

    res.status(201).json(device);
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const { name, type, deviceId, building, batteryLevel, discordWebhook } = req.body;

    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Update fields if provided
    if (name !== undefined) device.name = name;
    if (type !== undefined) device.type = type;
    if (deviceId !== undefined) device.deviceId = deviceId;
    if (building !== undefined) device.building = building;
    if (batteryLevel !== undefined) device.batteryLevel = batteryLevel;
    if (discordWebhook !== undefined) device.discordWebhook = discordWebhook;

    await device.save();

    const updatedDevice = await Device.findById(device._id).populate('building');
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Remove device from building's devices array
    if (device.building) {
      await Building.findByIdAndUpdate(
        device.building,
        { $pull: { devices: device._id } }
      );
    }

    // Delete associated readings
    await CO2Reading.deleteMany({ device: device._id });

    // Delete the device
    await Device.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
