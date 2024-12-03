import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const SuperAdmin = sequelize.define('SuperAdmin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default SuperAdmin;