import { sequelizeDB } from "./dbConnect";
import { User } from "./models/User";
import { Message } from "./models/Message";

async function assertDBConnectionOK() {
  console.log("Checking Database Connection...");

  try {
    await sequelizeDB.authenticate();
    sequelizeDB.sync();
    console.log("Database connection OK!");
  } catch (error) {
    console.error("Unable to connect to database");
    process.exit(1);
    throw error;
  }
}

assertDBConnectionOK();

export { sequelizeDB, User, Message };
