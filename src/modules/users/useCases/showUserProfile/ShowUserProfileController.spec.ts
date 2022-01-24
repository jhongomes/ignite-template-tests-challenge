import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";

let connection: Connection;
describe("Show profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get profile of user", async () => {
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

    const response = await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Beare ${token}` })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });
})
