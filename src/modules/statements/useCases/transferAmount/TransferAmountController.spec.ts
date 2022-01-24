import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;
describe("Transfer Amount Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to transfer amount", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    await request(app).post("/api/v1/users").send({
      name: "Luana Maria",
      email: "luana@gmail.com",
      password: "12345",
    });

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    const {
      body: { user },
    } = await request(app).post("/api/v1/sessions").send({
      email: "luana@gmail.com",
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

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .send({
        description: "Depósito do Mês",
        amount: 2000,
      })
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

  it("should not be able to transfer if amount is big than fund available", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Luana Maria",
      email: "luana@gmail.com",
      password: "12345",
    });

    await request(app).post("/api/v1/users").send({
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "luana@gmail.com",
      password: "12345",
    });

    const {
      body: { user },
    } = await request(app).post("/api/v1/sessions").send({
      email: "jhonatan@gmail.com",
      password: "12345"
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

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .send({
        description: "Depósito do Mês",
        amount: 3000,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Insufficient funds");
  });

  it("should not be able to transfer if user not exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "jhonatan@gmail.com",
      password: "12345"
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

    const response = await request(app)
      .post(`/api/v1/statements/transfer/6c6abb7f-a3b3-4849-8186-99848d72b419`)
      .send({
        description: "Depósito do Mês",
        amount: 2000,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("User not found");
  });
});
