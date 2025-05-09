import Sensor from '../models/sensor.model.js';
import CO2Reading from '../models/reading.model.js';
import Notification from '../models/notification.model.js';
import { sendNotification } from '../utils/notifier.js';

// Check CO₂ levels and send alerts if critical threshold is exceeded
export const checkCO2Levels = async () => {
  try {
    const criticalThreshold = 1200; // Critical CO₂ limit in ppm

    const readings = await CO2Reading.find({ co2Level: { $gte: criticalThreshold } }).populate('sensor');

    readings.forEach(reading => {
      sendNotification({
        userId: reading.sensor.userId,
        message: `High CO₂ level (${reading.co2Level} ppm) detected in ${reading.sensor.name}!`,
      });
    });

    console.log(`Notifications sent: ${readings.length}`);
  } catch (error) {
    console.error('Error while checking CO₂ levels:', error);
  }
};

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
};
