import cron from 'node-cron';
import CO2Reading from '../models/reading.model.js';
import { sendNotification } from '../utils/notifier.js';

// Nastavenie kontrolného intervalu (každých 15 minút)
cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('🔎 Kontrolujem vysoké CO₂ hodnoty...');
    const criticalThreshold = 1200; // Kritická hranica CO₂

    const readings = await CO2Reading.find({ co2Level: { $gte: criticalThreshold } }).populate('sensor');

    readings.forEach(reading => {
      sendNotification({
        userId: reading.sensor.userId,
        message: `⚠️ Vysoká hladina CO₂ (${reading.co2Level} ppm) v ${reading.sensor.name}!`,
      });
    });

    console.log(`✅ Odoslané upozornenia: ${readings.length}`);
  } catch (error) {
    console.error('❌ Chyba pri kontrole CO₂', error);
  }
});
