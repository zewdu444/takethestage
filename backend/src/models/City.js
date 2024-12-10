import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const City = sequelize.define("City", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
});

export default City;
