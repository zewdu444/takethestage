// models/TeacherShift.js
import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Teacher from './Teacher.js'; // Ensure correct path

const TeacherShift = sequelize.define('TeacherShift', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teacher_id: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Teacher,
            key: 'id'
        },
        onDelete: 'CASCADE',
    },
    day: {
        type: DataTypes.ENUM(
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ),
        allowNull: false
    },
    shift: {  
        type: DataTypes.ENUM('morning', 'afternoon', 'night'),
        allowNull: false
    }, 
    class_id : {
        type: DataTypes.INTEGER,
        allowNull: true
    } 
});

export default TeacherShift;
