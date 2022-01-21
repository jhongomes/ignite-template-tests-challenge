import { OperationType } from "../../../../modules/statements/entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  inMemoryStatementsRepository = new InMemoryStatementsRepository();
  inMemoryUsersRepository = new InMemoryUsersRepository();
  createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  createStatementUseCase = new CreateStatementUseCase(
    inMemoryUsersRepository,
    inMemoryStatementsRepository
  );

  it("Should be able to create a statement deposit", async () => {
    const data = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    };

    const { id } = await createUserUseCase.execute(data);

    const statement = {
      description: "Description Test",
      amount: 250,
      user_id: id,
      type: "deposit" as OperationType,
    }

    const created = await createStatementUseCase.execute(statement);
    expect(created).toHaveProperty("id");
    expect(created.type).toEqual("deposit");
  })


  it("should be able to create a statement withdraw", async () => {
    const data = {
      name: "Luana",
      email: "luana@gmail.com",
      password: "12345"
    };

    const { id } = await createUserUseCase.execute(data);

    const deposit = {
      description: "Description Test",
      amount: 500,
      user_id: id,
      type: "deposit" as OperationType,
    }

    const created = await createStatementUseCase.execute(deposit);

    const withdraw = {
      description: "Withdraw test",
      amount: 250,
      user_id: id,
      type: "withdraw" as OperationType,
    };

    const result = await createStatementUseCase.execute(withdraw);
    expect(result).toHaveProperty("id");
    expect(result.type).toEqual("withdraw");
  });

  it("should not be able to create a statement if the user does not exist", async () => {
    expect(async () => {
      const statement = {
        description: "Description Test",
        amount: 250,
        user_id: "123456",
        type: "deposit" as OperationType,
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
})
