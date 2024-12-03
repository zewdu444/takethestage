import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }, 
  institution_id: DataTypes.INTEGER,
  first_name: DataTypes.STRING,
  second_name: DataTypes.STRING,
  profile:{type:DataTypes.STRING,    allowNull: true
  },
  last_name: DataTypes.STRING,
  level_of_teaching: DataTypes.ENUM('grade 5-8', 'grade 9-10', 'college', 'university', 'masters'),
  region: DataTypes.STRING,
  woreda: DataTypes.STRING,
  sex: DataTypes.ENUM('male', 'female'),
  email: DataTypes.STRING, 
  cv: DataTypes.STRING, 
  phone_number: DataTypes.STRING, 
  password: DataTypes.STRING,
  is_teacher: { type: DataTypes.BOOLEAN, defaultValue: false },
  chosen_institution: { type: DataTypes.INTEGER, allowNull: true },
  campus: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, 
  training_or_competition: {  
    type: DataTypes.ENUM('training', 'competition'),
    allowNull: true 
  }, 
  tx_ref: { type: DataTypes.STRING, allowNull: true },
  paid: { type: DataTypes.BOOLEAN, defaultValue: false },

});

export default Teacher;