const mysql = require('mysql2');

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'sane3_tounsi'
});

module.exports = db;