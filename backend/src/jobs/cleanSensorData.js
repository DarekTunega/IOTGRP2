import cron from 'node-cron';
import CO2Reading from '../models/reading.model.js';

// Spustenie každú polnoc
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🧹 Spúšťam mazanie starých CO₂ dát...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    await CO2Reading.deleteMany({ timestamp: { $lt: sevenDaysAgo } });

    console.log('✅ Staré merania CO₂ boli vymazané.');
  } catch (error) {
    console.error('❌ Chyba pri čistení starých CO₂ údajov', error);
  }
});
