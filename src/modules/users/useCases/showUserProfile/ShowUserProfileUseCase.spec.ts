import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able show user profile info", async () => {
    const data = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    };

    const { id } = await createUserUseCase.execute(data);

    const user = await showUserProfileUseCase.execute(id);

    const expectedReturn = {
      id,
      email: user.email,
      name: user.name,
      password: user.password,
    };

    expect(user).toMatchObject(expectedReturn);
  });

  it("should not be able show user profile info with user not exists", async () => {
    const data = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    };

    await createUserUseCase.execute(data);

    await expect(async () => {
      await showUserProfileUseCase.execute("1234");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
