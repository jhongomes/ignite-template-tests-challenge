import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jhonatan Gomes",
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "jhonatan@gmail.com",
      password: "12345",
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Depósito do Mês",
        amount: 3000,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });
})
