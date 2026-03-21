require('dotenv').config();

const app      = require('./src/app');
const { initDB } = require('./src/config/database');
const rabbitmq = require('./src/services/rabbitmq.service');

const PORT = process.env.PORT || 3003;

const start = async () => {
  try {
    console.log('[DB] Conectando a MySQL...');
    await initDB();
    console.log('[DB] MySQL listo');

    console.log('[RabbitMQ] Conectando...');
    await rabbitmq.connect();

    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('  Location Service iniciado');
      console.log(`  Puerto: ${PORT}`);
      console.log('='.repeat(50));
    });
  } catch (err) {
    console.error('[Server] Error al iniciar:', err.message);
    process.exit(1);
  }
};

start();
