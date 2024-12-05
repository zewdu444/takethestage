import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // tx_ref:{

  // }
  grade: DataTypes.STRING,
  first_name: DataTypes.STRING,
  second_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  sex: DataTypes.ENUM('male', 'female'),
  region_id: DataTypes.INTEGER, 
  city: DataTypes.STRING,
  woreda: DataTypes.STRING,
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parents_phone_number: DataTypes.STRING,
  password: DataTypes.STRING,
  profile:{type:DataTypes.STRING,    allowNull: true,
  },
  training_or_competition: {  
    type: DataTypes.ENUM('training', 'competition'),
    allowNull: true
  },
  chosen_institution: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shift1: {  
    type: DataTypes.ENUM('morning', 'afternoon', 'night'),
    allowNull: true
  },
  shift2: {  
    type: DataTypes.ENUM('morning', 'afternoon', 'night'),
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('completed', 'pending', 'rejected'),
    allowNull: true
  },
class_type:{
type:DataTypes.ENUM('5678', '910','11-12', 'college', 'university', 'masters'),
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  class2: {
    type: DataTypes.INTEGER,
    allowNull: true},
  date1: {
    type: DataTypes.STRING,
    allowNull: true
  }, date2: {
    type: DataTypes.STRING,
    allowNull: true
  },day1:{
    type: DataTypes.ENUM(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
  ),
  allowNull: true
  
  }
  ,day2:{
    type: DataTypes.ENUM(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
  ),
  allowNull: true
  }

});

export default Student;