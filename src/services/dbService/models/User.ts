import { DataTypes } from "sequelize";
import { sequelizeDB } from "../dbConnect";

export const User = sequelizeDB.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
});
