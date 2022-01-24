import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;
describe("Get balance", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("should be able to get a balance", async () => {
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

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Depósito do Mês",
        amount: 2000,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        description: "Saque do Mês",
        amount: 2000,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
  });

})
