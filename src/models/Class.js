import {  DataTypes } from 'sequelize';
import sequelize  from '../../config/database.js';


const Class = sequelize.define('Class', {
  id: {  
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  institution_id: DataTypes.INTEGER,
  free_space_morning: { defaultValue: 30, type: DataTypes.INTEGER },
  free_space_afternoon: { defaultValue: 30, type: DataTypes.INTEGER },
  free_space_night: { defaultValue: 30, type: DataTypes.INTEGER },
  date:{
    type: DataTypes.ENUM(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
  ),
  allowNull: true
  },
  training_or_competition: {  
    type: DataTypes.ENUM('training', 'competition'),
    allowNull: true
  }, 
  teacher_id:{
    type:DataTypes.INTEGER,
    allowNull: true
  }
}); 





export default Class;


