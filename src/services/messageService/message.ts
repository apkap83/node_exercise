import { Model } from "sequelize";
import { Message } from "../dbService/initDBAndModels";

export interface AddMessageInDBArgs {
  id: string;
  content: string;
  sender: Date;
  receiver: string;
  seen: string;
  timestampSent: Date;
}

export const addMessageInDB = async ({
  id,
  content,
  sender,
  receiver,
  seen,
  timestampSent,
}: AddMessageInDBArgs) => {
  try {
    const user = await Message.create({
      id,
      content,
      sender,
      receiver,
      seen,
      timestampSent,
    });
  } catch (error) {
    throw error;
  }
};
