const { Sequelize } = require("sequelize");
const config = require("config");
import loggerDB from "../../../config/winston-config";

// Custom logging function
function sequelizeLogging(msg: string) {
  loggerDB.info(msg);
}

export const sequelizeDB = new Sequelize(
  config.get("DB.NAME"),
  config.get("DB.USER"),
  config.get("DB.PASSWORD"),
  {
    host: config.get("DB.HOST"),
    port: 5433,
    dialect: "postgres",
    dialectOptions: {
      charset: "utf8",
    },
    define: {
      freezeTableName: true,
    },
    logging: sequelizeLogging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000, //  maximum time (in milliseconds) that Sequelize should wait when trying to acquire a database connection from the connection pool.
      idle: 10000, //This option specifies the maximum time (in milliseconds) that a connection can remain idle in the pool before Sequelize considers it as "idle" and potentially closes it to free up resources.
    },
  }
);
