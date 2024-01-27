import express, { Request, Response } from "express";
import { Op } from "sequelize";

import { User, Message } from "../services/dbService/initDBAndModels";
import { loadUsersFromExcel, loadMessagesFromExcel } from "../utils/helpers";

export const myRouter = express.Router();

myRouter.post("/feedDB", async (req: Request, res: Response) => {
  try {
    await loadUsersFromExcel();
    await loadMessagesFromExcel();
    return res.status(200).send("OK!");
  } catch (error) {
    return res.status(500).send("Error during load of excel to DB");
  }
});

myRouter.get("/users", async (req: Request, res: Response) => {
  const { firstName, surname, gender } = req.query;

  const whereClause: any = {};

  if (firstName) {
    whereClause.firstName = firstName;
  }

  if (surname) {
    whereClause.surname = surname;
  }

  if (gender) {
    whereClause.gender = gender;
  }

  try {
    const users = await User.findAll({
      where: whereClause,
    });

    res.json(users);
  } catch (error) {
    return res.status(500).send("Error during retrieval of users");
  }
});

myRouter.get("/messages", async (req: Request, res: Response) => {
  try {
    const { user1Id, user2Id } = req.query;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: user1Id, receiver: user2Id },
          { sender: user2Id, receiver: user1Id },
        ],
      },
      order: [["timestampSent", "DESC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
