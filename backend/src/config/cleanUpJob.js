import cron from 'node-cron';
import { deleteOldReadings } from '../controllers/reading.controller.js';

cron.schedule('0 0 * * *', async () => {
  console.log('🧹 Spúšťam mazanie starých CO₂ dát...');
  await deleteOldReadings();
  console.log('✅ Staré merania CO₂ vymazané.');
});
