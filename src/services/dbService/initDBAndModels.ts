import { sequelizeDB } from "./dbConnect";
import { User } from "./models/User";
import { Message } from "./models/Message";
import logger from "../../../config/winston-config";

async function assertDBConnectionOK() {
  logger.info("Checking Database Connection...");

  try {
    await sequelizeDB.authenticate();
    sequelizeDB.sync();
    logger.info("Database connection OK!");
  } catch (error) {
    logger.error("Unable to connect to database");
    process.exit(1);
  }
}

export async function dropAndCreateUsersTable() {
  await User.drop();
  await User.sync();
}

export async function dropAndCreateMessagesTable() {
  await Message.drop();
  await Message.sync();
}

if (!sequelizeDB) {
  assertDBConnectionOK();
}

export { sequelizeDB, User, Message };
