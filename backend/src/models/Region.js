import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Region = sequelize.define('Region', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,

});

export default Region 
