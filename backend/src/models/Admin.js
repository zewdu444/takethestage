import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  created_at: DataTypes.DATE
});

export default Admin;