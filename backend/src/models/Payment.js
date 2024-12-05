import { Sequelize, DataTypes } from 'sequelize';
import sequelize  from '../../config/database.js';


const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: DataTypes.INTEGER,
  amount: DataTypes.DECIMAL,
  date: DataTypes.DATE,
  status: DataTypes.ENUM('paid', 'overdue', 'pending','rejected'),
  picture:DataTypes.STRING,
  tx_ref:{
    type: DataTypes.STRING,
    allowNull: true,
  }
});

export default Payment;