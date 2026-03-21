// Modelo BikeLocation — telemetría GPS de cada bicicleta
const db = require('../config/database');

class BikeLocationModel {
  static initTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS bike_locations (
        bike_id    INTEGER PRIMARY KEY,
        lat        REAL NOT NULL,
        lng        REAL NOT NULL,
        heading    REAL DEFAULT 0,
        speed      REAL DEFAULT 0,
        status     TEXT DEFAULT 'available',
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  static findByBikeId(bikeId) {
    return db.prepare('SELECT * FROM bike_locations WHERE bike_id = ?').get(bikeId);
  }

  // Inicializa ubicación aleatoria dentro del bounding box de Medellín
  static initLocation(bikeId, status = 'available') {
    const lat = 6.1600 + Math.random() * 0.1900;   // 6.16 – 6.35
    const lng = -75.6200 + Math.random() * 0.0700;  // -75.62 – -75.55

    db.prepare(`
      INSERT OR REPLACE INTO bike_locations (bike_id, lat, lng, heading, speed, status, updated_at)
      VALUES (?, ?, ?, 0, 0, ?, datetime('now'))
    `).run(bikeId, lat, lng, status);

    return db.prepare('SELECT * FROM bike_locations WHERE bike_id = ?').get(bikeId);
  }

  // Actualiza posición — simula movimiento si está en uso
  static updateLocation(bikeId, status) {
    let loc = BikeLocationModel.findByBikeId(bikeId);
    if (!loc) loc = BikeLocationModel.initLocation(bikeId, status);

    if (status !== 'in_use') {
      // Bicicleta estática — solo actualiza timestamp y status
      db.prepare(`
        UPDATE bike_locations SET status = ?, updated_at = datetime('now') WHERE bike_id = ?
      `).run(status, bikeId);
    } else {
      // Simula movimiento GPS pequeño (~5-15 metros)
      const delta   = 0.0001;
      const newLat  = loc.lat + (Math.random() - 0.5) * delta;
      const newLng  = loc.lng + (Math.random() - 0.5) * delta;
      const heading = Math.random() * 360;
      const speed   = 8 + Math.random() * 12; // 8–20 km/h

      db.prepare(`
        UPDATE bike_locations
        SET lat = ?, lng = ?, heading = ?, speed = ?, status = ?, updated_at = datetime('now')
        WHERE bike_id = ?
      `).run(newLat, newLng, heading, speed, status, bikeId);
    }

    return db.prepare('SELECT * FROM bike_locations WHERE bike_id = ?').get(bikeId);
  }

  // Actualiza status desde evento RabbitMQ
  static syncStatus(bikeId, status) {
    const exists = BikeLocationModel.findByBikeId(bikeId);
    if (!exists) {
      BikeLocationModel.initLocation(bikeId, status);
    } else {
      db.prepare(`UPDATE bike_locations SET status = ? WHERE bike_id = ?`).run(status, bikeId);
    }
  }
}

module.exports = BikeLocationModel;
