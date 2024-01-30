import xlsx from "node-xlsx";
import fs from "fs";
import path from "path";
import logger from "../../config/winston-config";
import {
  dropAndCreateUsersTable,
  dropAndCreateMessagesTable,
} from "../services/dbService/initDBAndModels";
import { addUserInDB, AddUserInDBArgs } from "../services/userService/user";
import {
  addMessageInDB,
  AddMessageInDBArgs,
} from "../services/messageService/message";

interface UserSheetData {
  firstName: string;
  surname: string;
  dateOfBirth: Date;
  gender: string;
  userName: string;
}

function excelDateToJSDate(serial: number) {
  const excelEpoch = new Date(1899, 11, 31);
  const dayAdjustment = serial >= 61 ? -1 : 0;

  // Calculate the total number of milliseconds: days + fractional day for time
  const totalMilliseconds = (serial + dayAdjustment) * 86400000;

  return new Date(excelEpoch.getTime() + totalMilliseconds);
}

export const loadUsersFromExcel = async () => {
  try {
    logger.info("Truncating Existing Users...");
    await dropAndCreateUsersTable();

    logger.info("Loading Users to DB...");
    const usersSheetName = "users";

    const fileBuffer = fs.readFileSync(
      path.join(__dirname, "../../seeds.xlsx")
    );
    const workSheetsFromFile = xlsx.parse(fileBuffer);

    // For Every sheet in excel file...
    for (const sheet of workSheetsFromFile) {
      // If it's the users' sheet...
      if (sheet.name === usersSheetName) {
        if (sheet.data && sheet.data.length > 0) {
          sheet.data.map((rowData: any[]) => {
            if (rowData.length >= 4) {
              const [id, firstName, surname, dateOfBirth, gender, userName] =
                rowData;

              const user: UserSheetData = {
                firstName,
                surname,
                dateOfBirth: excelDateToJSDate(dateOfBirth),
                gender,
                userName,
              };

              addUserInDB(user);
            }
          });
        }
      }
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const loadMessagesFromExcel = async () => {
  try {
    logger.info("Truncating Existing Messages...");
    await dropAndCreateMessagesTable();

    logger.info("Loading Messages to DB...");
    const messagesSheetName = "messages";

    const fileBuffer = fs.readFileSync(
      path.join(__dirname, "../../seeds.xlsx")
    );
    const workSheetsFromFile = xlsx.parse(fileBuffer);

    // For Every sheet in excel file...
    for (const sheet of workSheetsFromFile) {
      // If it's the messages' sheet...
      if (sheet.name === messagesSheetName) {
        if (sheet.data && sheet.data.length > 0) {
          sheet.data.map((rowData: any[]) => {
            if (rowData.length >= 3) {
              const [id, content, sender, receiver, seen, timestampSent] =
                rowData;

              const message: AddMessageInDBArgs = {
                id,
                content,
                sender,
                receiver,
                seen,
                timestampSent: excelDateToJSDate(timestampSent),
              };

              addMessageInDB(message);
            }
          });
        }
      }
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
