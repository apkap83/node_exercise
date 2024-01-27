import express from "express";
import path from "path";

import xlsx from "node-xlsx";
import fs from "fs";

import { User, Message } from "../services/dbService/initDBAndModels";

import { addUserInDB, AddUserInDBArgs } from "../services/userService/user";
import {
  addMessageInDB,
  AddMessageInDBArgs,
} from "../services/messageService/message";

export const myRouter = express.Router();

interface UserSheetData {
  firstName: string;
  surname: string;
  dateOfBirth: Date;
  gender: string;
  userName: string;
}

myRouter.post("/feedDB", async (req, res) => {
  const usersSheetName = "users";
  const messagesSheetName = "messages";

  // Drop the "users" and "messages" tables if they exist
  await User.drop();
  await Message.drop();

  // Recreate the "users" and "messages" tables
  await User.sync();
  await Message.sync();

  const fileBuffer = fs.readFileSync(path.join(__dirname, "../../seeds.xlsx"));
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

            // Convert dateOfBirth to a JavaScript Date object
            const dateOfBirthAsDate = new Date(dateOfBirth * 1000);

            const user: UserSheetData = {
              firstName,
              surname,
              dateOfBirth: dateOfBirthAsDate,
              gender,
              userName,
            };

            addUserInDB(user);
          }
        });
      }
    }

    // If it's the messages' sheet...
    if (sheet.name === messagesSheetName) {
      if (sheet.data && sheet.data.length > 0) {
        sheet.data.map((rowData: any[]) => {
          if (rowData.length >= 3) {
            const [id, content, sender, receiver, seen, timestampSent] =
              rowData;

            // Convert dateOfBirth to a JavaScript Date object
            const timestampSentAsDate = new Date(timestampSent * 1000);

            const message: AddMessageInDBArgs = {
              id,
              content,
              sender,
              receiver,
              seen,
              timestampSent: timestampSentAsDate,
            };

            addMessageInDB(message);
          }
        });
      }
    }
  }
  return res.status(200).send("OK!");
});
