import express, { Request, Response } from "express";
import { Op } from "sequelize";

import { sequelizeDB } from "../services/dbService/initDBAndModels";
import { User, Message } from "../services/dbService/initDBAndModels";
import { loadUsersFromExcel, loadMessagesFromExcel } from "../utils/helpers";

export const myRouter = express.Router();

myRouter.post("/feedDB", async (req: Request, res: Response) => {
  try {
    await loadUsersFromExcel();
    await loadMessagesFromExcel();
    return res
      .status(200)
      .send({ message: "Users and Messages Loaded in DB!" });
  } catch (error) {
    console.error(error);
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

myRouter.get("/user/:userId/messages", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const query = `
    SELECT 
        u."userName", 
        m."content", 
        m."sender", 
        m."receiver", 
        m."timestampSent"
    FROM 
        (
            SELECT
                LEAST("sender", "receiver") AS user1,
                GREATEST("sender", "receiver") AS user2,
                MAX("timestampSent") AS latest
            FROM 
                Messages
            WHERE 
                "sender" = :userId OR "receiver" = :userId
            GROUP BY 
                LEAST("sender", "receiver"), 
                GREATEST("sender", "receiver")
        ) AS latest_msgs
    JOIN 
        Messages m ON (m."sender" = latest_msgs.user1 AND m."receiver" = latest_msgs.user2 OR m."sender" = latest_msgs.user2 AND m."receiver" = latest_msgs.user1) AND m."timestampSent" = latest_msgs.latest
    JOIN 
        Users u ON u.id = CASE WHEN :userId = latest_msgs.user1 THEN latest_msgs.user2 ELSE latest_msgs.user1 END
    ORDER BY 
        m."timestampSent" DESC;
    `;

    const results = await sequelizeDB.query(query, {
      replacements: { userId: userId },
      type: sequelizeDB.QueryTypes.SELECT,
    });
    console.log(results);
    res.json(results);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});
