// Configuración MySQL — Location Service
const mysql = require('mysql2/promise');

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.MYSQLHOST     || 'localhost',
      port:     process.env.MYSQLPORT     || 3306,
      user:     process.env.MYSQLUSER     || 'root',
      password: process.env.MYSQLPASSWORD || '',
      database: process.env.MYSQLDATABASE || 'location_db',
      waitForConnections: true,
      connectionLimit: 10,
      ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
};

const initDB = async () => {
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS stations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      address    VARCHAR(255),
      lat        DECIMAL(10,7) NOT NULL,
      lng        DECIMAL(10,7) NOT NULL,
      capacity   INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS bike_locations (
      bike_id    INT PRIMARY KEY,
      lat        DECIMAL(10,7) NOT NULL,
      lng        DECIMAL(10,7) NOT NULL,
      heading    DECIMAL(5,2) DEFAULT 0,
      speed      DECIMAL(5,2) DEFAULT 0,
      status     VARCHAR(50) DEFAULT 'available',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Insertar estaciones semilla si no existen
  const [rows] = await pool.execute('SELECT COUNT(*) as n FROM stations');
  if (rows[0].n === 0) {
    const seeds = [
      ['Estación El Poblado',  'Cra 43A #11-30, Medellín',   6.2087, -75.5699, 15],
      ['Estación Laureles',    'Cra 76 #33-50, Medellín',    6.2441, -75.5913, 12],
      ['Estación Centro',      'Calle 50 #49-44, Medellín',  6.2518, -75.5636, 15],
      ['Estación Envigado',    'Calle 40S #27-20, Envigado', 6.1697, -75.5827, 10],
      ['Estación Bello',       'Cra 50 #55-20, Bello',       6.3332, -75.5567,  8],
    ];
    for (const s of seeds) {
      await pool.execute(
        'INSERT INTO stations (name, address, lat, lng, capacity) VALUES (?, ?, ?, ?, ?)', s
      );
    }
    console.log('[DB] 5 estaciones Medellín insertadas');
  }

  console.log('[DB] Tablas stations y bike_locations listas');
};

module.exports = { getPool, initDB };
