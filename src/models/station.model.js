// Modelo Station — puntos fijos de retiro y entrega en el área metropolitana de Medellín
const db = require('../config/database');

class StationModel {
  static initTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS stations (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        address    TEXT,
        lat        REAL NOT NULL,
        lng        REAL NOT NULL,
        capacity   INTEGER DEFAULT 10,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Insertar estaciones semilla si la tabla está vacía
    const count = db.prepare('SELECT COUNT(*) as n FROM stations').get();
    if (count.n === 0) {
      const insert = db.prepare(`
        INSERT INTO stations (name, address, lat, lng, capacity)
        VALUES (@name, @address, @lat, @lng, @capacity)
      `);
      const seeds = [
        { name: 'Estación El Poblado',  address: 'Cra 43A #11-30, Medellín',   lat: 6.2087, lng: -75.5699, capacity: 15 },
        { name: 'Estación Laureles',    address: 'Cra 76 #33-50, Medellín',    lat: 6.2441, lng: -75.5913, capacity: 12 },
        { name: 'Estación Centro',      address: 'Calle 50 #49-44, Medellín',  lat: 6.2518, lng: -75.5636, capacity: 15 },
        { name: 'Estación Envigado',    address: 'Calle 40S #27-20, Envigado', lat: 6.1697, lng: -75.5827, capacity: 10 },
        { name: 'Estación Bello',       address: 'Cra 50 #55-20, Bello',       lat: 6.3332, lng: -75.5567, capacity: 8  },
      ];
      for (const s of seeds) insert.run(s);
      console.log('[StationModel] 5 estaciones Medellín insertadas');
    }
  }

  static findAll() {
    return db.prepare('SELECT * FROM stations ORDER BY name').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
  }
}

module.exports = StationModel;
