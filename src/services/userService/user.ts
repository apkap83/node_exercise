import { Model } from "sequelize";
import { User } from "../dbService/initDBAndModels";

export interface AddUserInDBArgs {
  firstName: string;
  surname: string;
  dateOfBirth: Date;
  gender: string;
  userName: string;
}

export const addUserInDB = async ({
  firstName,
  surname,
  dateOfBirth,
  gender,
  userName,
}: AddUserInDBArgs) => {
  try {
    const user = await User.create({
      firstName,
      surname,
      dateOfBirth,
      gender,
      userName,
    });
  } catch (error) {
    throw error;
  }
};
