
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao abrir o banco de dados:", err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        db.serialize(() => {
            db.run("PRAGMA foreign_keys = ON;");

            const createUsersTableSQL = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.run(createUsersTableSQL, (err) => {
                if (err) console.error("Erro ao criar tabela 'users':", err.message);
                else console.log("Tabela 'users' pronta para uso.");
            });

            const createUserInterestsTableSQL = `
                CREATE TABLE IF NOT EXISTS user_interests (
                    user_id INTEGER NOT NULL,
                    car_id INTEGER NOT NULL,
                    PRIMARY KEY (user_id, car_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            db.run(createUserInterestsTableSQL, (err) => {
                if (err) console.error("Erro ao criar tabela 'user_interests':", err.message);
                else console.log("Tabela 'user_interests' pronta para uso.");
            });
        });
    }
});

module.exports = db;