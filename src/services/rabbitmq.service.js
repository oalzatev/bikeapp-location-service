// Consumer RabbitMQ — sincroniza eventos de bikes desde Bike Service
// Escucha: bike.assigned, bike.released, bike.updated
const amqplib       = require('amqplib');
const BikeLocation  = require('../models/bike-location.model');

const EXCHANGE_NAME = 'bike.events';
const QUEUE_NAME    = 'location-service.bike-events';

let connection = null;
let channel    = null;

const connect = async () => {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';
  try {
    connection = await amqplib.connect(url);
    console.log('[RabbitMQ] Conexión establecida');

    connection.on('error', (err) => console.error('[RabbitMQ] Error:', err.message));
    connection.on('close', () => {
      console.warn('[RabbitMQ] Conexión cerrada. Reintentando en 5s...');
      setTimeout(connect, 5000);
    });

    channel = await connection.createChannel();

    // Exchange para eventos de bicicletas
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Suscribir a eventos de cambio de estado de bikes
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'bike.assigned');
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'bike.released');
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'bike.updated');

    channel.consume(QUEUE_NAME, (msg) => {
      if (!msg) return;
      try {
        const { data } = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;

        console.log(`[RabbitMQ] Evento recibido: ${routingKey}`, { bike_id: data.id, status: data.status });

        // Sincronizar status de la bike en la tabla de ubicaciones
        BikeLocation.syncStatus(data.id, data.status);
        channel.ack(msg);
      } catch (err) {
        console.error('[RabbitMQ] Error procesando mensaje:', err.message);
        channel.nack(msg, false, false);
      }
    });

    console.log(`[RabbitMQ] Consumer activo en cola: ${QUEUE_NAME}`);
  } catch (err) {
    console.error('[RabbitMQ] Error al conectar:', err.message);
    console.log('[RabbitMQ] Reintentando en 5s...');
    setTimeout(connect, 5000);
  }
};

module.exports = { connect };
