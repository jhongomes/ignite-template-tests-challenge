import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;
describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a specific statement", async () => {
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

    const {
      body: { id },
    } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Depósito do Mês",
        amount: 2000,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("sender_id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to get a specific statement if statement not exists", async () => {
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
      .get(`/api/v1/statements/c4e19f79-3652-43e1-9b57-8bc67a4c5c0e`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Statement not found");
  });
});
