import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate user", async () => {
    const user = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    }

    await createUserUseCase.execute(user)

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const responseObject = {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      token: result.token,
    };

    expect(result).toHaveProperty("token");
    expect(result).toMatchObject(responseObject);
  });


  it("should be able to authenticate user with email or password incorrect", async () => {
    expect(async () => {
      const user = {
        name: "Jhonatan",
        email: "jhonatan@gmail.com",
        password: "12345"
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "user.password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})
