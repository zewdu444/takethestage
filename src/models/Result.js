import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
  },
  exam_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  score: { 
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

export default Result;