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

export const getAllUsersFromDB = async () => {
  try {
    const allUsers = await User.findAll({ order: [["userName", "ASC"]] });

    return allUsers;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async ({ id }: { id: string }) => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw error;
  }
};
