import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }, 
  teacher_id: DataTypes.INTEGER,
  application_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  submission_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  application_letter: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  chosen_institution: {type: DataTypes.INTEGER, allowNull: true},
  campus: {type: DataTypes.STRING, allowNull: true},
  shift: DataTypes.ENUM('morning', 'afternoon', 'night'),
});


export default Application;