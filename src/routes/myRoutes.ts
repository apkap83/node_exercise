import express, { Request, Response } from "express";
import { Op } from "sequelize";

import { sequelizeDB } from "../services/dbService/initDBAndModels";
import { User, Message } from "../services/dbService/initDBAndModels";
import { loadUsersFromExcel, loadMessagesFromExcel } from "../utils/helpers";

import logger from "../../config/winston-config";

export const myRouter = express.Router();

/*
  Create an API endpoint that when receives a POST request to the “/feedDB” route, 
  it feeds the database with data. Under the hood your endpoint reads the seed.xlsx file 
  and imports the data to the database.
*/
myRouter.post("/feedDB", async (req: Request, res: Response) => {
  try {
    await loadUsersFromExcel();
    await loadMessagesFromExcel();
    logger.info("Users and Messages Loaded in DB!");
    return res
      .status(200)
      .send({ message: "Users and Messages Loaded in DB!" });
  } catch (error) {
    logger.error(error);
    return res.status(500).send("Error during load of excel to DB");
  }
});

/*
  Create an API endpoint in order to serve the retrieval of users based on a set of parameters.
*/
myRouter.get("/users", async (req: Request, res: Response) => {
  // Sanitize and validate inputs
  const firstName =
    typeof req.query.firstName === "string" ? req.query.firstName.trim() : null;
  const surname =
    typeof req.query.surname === "string" ? req.query.surname.trim() : null;
  const gender =
    typeof req.query.gender === "string" ? req.query.gender.trim() : null;

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

    logger.info(
      "Fetching User with parameters: " + JSON.stringify(whereClause)
    );
    res.json(users);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("Error during retrieval of users");
  }
});

/*
  Create an API endpoint (or use the existing one) that receives the user-ids of two 
  users and retrieves all of the messages that they have exchanged, ordered by the most 
  recent sent.
*/
myRouter.get("/messages", async (req: Request, res: Response) => {
  try {
    // Type casting and sanitizing inputs
    const user1Id = parseInt(req.query.user1Id as string);
    const user2Id = parseInt(req.query.user2Id as string);

    // Validate the parsed integers
    if (isNaN(user1Id) || isNaN(user2Id)) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: user1Id, receiver: user2Id },
          { sender: user2Id, receiver: user1Id },
        ],
      },
      order: [["timestampSent", "DESC"]],
    });

    logger.info("Fetching Messages with parameters");
    res.json(messages);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/*
  Create an API endpoint that receives a user-id and then retrieves a list of users, 
  sorted by the most recent message that has been exchanged between the user requested 
  and the rest of the users (just like your social-media applications). 
  In this requirement you might need to give us some instructions on how to run it.
*/
myRouter.get("/user/:userId/messages", async (req, res) => {
  try {
    const userIdStr = req.params.userId;

    // Sanitizing input field :userId
    if (!userIdStr || isNaN(Number(userIdStr))) {
      return res.status(400).send("Invalid user ID");
    }

    const userId = parseInt(userIdStr, 10);

    // Additional check to ensure userId is a positive number
    if (userId <= 0) {
      return res.status(400).send("User ID must be a positive integer");
    }

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

    logger.info("Fetching Messages for user id: " + userId);
    res.json(results);
  } catch (error: any) {
    logger.error(error);
    res.status(500).send(error.message);
  }
});
