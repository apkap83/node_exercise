import express from "express";

import { User, Message } from "../services/dbService/initDBAndModels";

import { addUserInDB, AddUserInDBArgs } from "../services/userService/user";
import {
  addMessageInDB,
  AddMessageInDBArgs,
} from "../services/messageService/message";

import { loadUsersFromExcel, loadMessagesFromExcel } from "../utils/helpers";

export const myRouter = express.Router();

interface UserSheetData {
  firstName: string;
  surname: string;
  dateOfBirth: Date;
  gender: string;
  userName: string;
}

myRouter.post("/feedDB", async (req, res) => {
  await loadUsersFromExcel();
  await loadMessagesFromExcel();
  return res.status(200).send("OK!");
});
