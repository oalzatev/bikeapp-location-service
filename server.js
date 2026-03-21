require('dotenv').config();

const app           = require('./src/app');
const StationModel  = require('./src/models/station.model');
const BikeLocation  = require('./src/models/bike-location.model');
const rabbitmq      = require('./src/services/rabbitmq.service');

const PORT = process.env.PORT || 3003;

const start = async () => {
  try {
    console.log('[DB] Inicializando base de datos SQLite...');
    StationModel.initTable();
    BikeLocation.initTable();
    console.log('[DB] Tablas stations y bike_locations listas');

    console.log('[RabbitMQ] Conectando como consumer...');
    await rabbitmq.connect();

    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('  Location Service iniciado');
      console.log(`  Puerto: ${PORT}`);
      console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
    });
  } catch (err) {
    console.error('[Server] Error al iniciar:', err.message);
    process.exit(1);
  }
};

start();
