import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;
describe("Authenticate user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("Shoulb be able to authenticate user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jhonatan Gomes",
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user.id");
    expect(response.body).toHaveProperty("user.name");
    expect(response.body).toHaveProperty("user.email");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a user if credentials are wrong", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jhonatan Gomes",
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "jhonatan@gmail.com",
      password: "12",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });
})
