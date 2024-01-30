import request from "supertest";
import { sequelizeDB } from "../src/services/dbService/dbConnect";
import { User, Message } from "../src/services/dbService/initDBAndModels";
import config from "config";
import { app } from "../src/App";

const prefixURL = "/api";

describe("Tests", () => {
  test("Loading Users and Messages to DB", async () => {
    const response = await request(app).post(`${prefixURL}/feedDB`);
    expect(response.statusCode).toBe(200);

    // Check if the length of the array is greater than 10 (arbitrary number)
    const usersCount = await User.count();
    expect(usersCount).toBeGreaterThanOrEqual(10);

    const messagesCount = await Message.count();
    expect(messagesCount).toBeGreaterThanOrEqual(10);
  });

  test("Get All Users from DB", async () => {
    const usersCount = await User.count();
    const response = await request(app).get(`${prefixURL}/users`);
    expect(response.statusCode).toBe(200);

    // Check if the length of the array matches the count from the database
    expect(response.body.length).toBe(usersCount);

    // Check if the response body is an array
    expect(response.body).toBeInstanceOf(Array);

    // Check the structure of the first item if the array is not empty
    if (response.body.length > 0) {
      const expectedStructure = {
        id: expect.any(Number),
        firstName: expect.any(String),
        surname: expect.any(String),
        dateOfBirth: expect.any(String),
        gender: expect.any(String),
        userName: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      expect(response.body[0]).toMatchObject(expectedStructure);
    }
  });

  test("Get a specific User based on properties", async () => {
    const usersCount = await User.findAll();

    const firstName = usersCount[5].dataValues["firstName"];
    const surname = usersCount[5].dataValues["surname"];
    const userName = usersCount[5].dataValues["userName"];

    const response = await request(app).get(
      `${prefixURL}/users?firstName=${firstName}&surname=${surname}&userName=${userName}`
    );

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].userName).toBe(userName);
  });

  it("should return a 400 status for invalid user IDs", async () => {
    const response = await request(app)
      .get(`${prefixURL}/messages`)
      .query({ user1Id: "abc", user2Id: "xyz" });
    expect(response.statusCode).toBe(400);
  });

  it("should return a list of messages for valid user IDs", async () => {
    // Assuming user1Id and user2Id are valid user IDs in your database
    const user1Id = 1;
    const user2Id = 2;

    const response = await request(app)
      .get(`${prefixURL}/messages`)
      .query({ user1Id, user2Id });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return messages for a valid user ID", async () => {
    const validUserId = 1; // Replace with a valid user ID from your database
    const response = await request(app).get(
      `${prefixURL}/user/${validUserId}/messages`
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Add more expectations here if necessary, like checking the content of response.body
  });

  it("should return a 400 status for an invalid user ID", async () => {
    const invalidUserId = "invalid";
    const response = await request(app).get(
      `${prefixURL}/user/${invalidUserId}/messages`
    );

    expect(response.statusCode).toBe(400);
  });
});
