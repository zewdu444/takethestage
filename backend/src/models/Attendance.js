import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
 
const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: DataTypes.INTEGER,
  date: DataTypes.DATE,
  present: DataTypes.BOOLEAN
});

export default Attendance; 