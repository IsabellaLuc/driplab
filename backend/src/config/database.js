const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: false,
        // Banco na nuvem (ex.: TiDB Cloud) exige conexão segura (SSL).
        // No computador local deixe DB_SSL vazio ou false.
        dialectOptions: process.env.DB_SSL === 'true'
            ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
            : {},
        define: {
            underscored: true,
            freezeTableName: true
        }
    }
);

module.exports = sequelize;
