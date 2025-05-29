import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import buildingRoutes from './src/routes/building.routes.js';
import sensorRoutes from './src/routes/sensor.routes.js';
import readingRoutes from './src/routes/reading.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';

import './src/models/user.model.js';
import './src/models/building.model.js';
import './src/models/device.model.js'; 
import './src/models/sensor.model.js';
// import './src/models/reading.model.js';
// import './src/models/notification.model.js';

import errorHandler from './src/middleware/errorHandler.js';

// Načítanie konfigurácie zo súboru `.env`
dotenv.config();

// Inicializácia Express aplikácie
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Pripojenie k databáze
connectDB();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/notifications', notificationRoutes);

// Middleware na spracovanie chýb
app.use(errorHandler);

// Spustenie servera
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server beží na porte ${PORT}`);
});


app.get('/api/data', (req, res) => {
  res.json({ message: "Úspešné pripojenie k API!" });
});

