import { app } from "../../../../app"
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database"

let connection: Connection;
describe("Create User", () => {
  beforeAll(async () => {
    connection = await createConnection()

    await connection.runMigrations()
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Jhonatan Gomes",
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user if user exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jhonatan Gomes",
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "Jhonatan Gomes",
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("User already exists");
  });

})
