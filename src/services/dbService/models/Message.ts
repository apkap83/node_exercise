import { DataTypes } from "sequelize";
import { sequelizeDB } from "../dbConnect";

export const Message = sequelizeDB.define("messages", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  sender: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiver: {
    type: DataTypes.INTEGER,
  },
  seen: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  timestampSent: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
