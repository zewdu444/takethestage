import { Sequelize, DataTypes } from 'sequelize';
import sequelize  from '../../config/database.js';

const Institution = sequelize.define('Institution', {
  id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }, 
  name: DataTypes.STRING,
  level: DataTypes.ENUM('5678', '910','11-12', 'college', 'university', 'masters'),
  region: DataTypes.INTEGER,
  city: DataTypes.STRING, 
  woreda: DataTypes.STRING,
  classes: DataTypes.INTEGER,
});

export default Institution;



