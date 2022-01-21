import { OperationType } from "../../../../modules/statements/entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Get Statement Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able get statement operation", async () => {
    const data = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    };

    const { id: user_id } = await createUserUseCase.execute(data);

    const deposit = {
      description: "Deposit Test",
      amount: 400,
      user_id: user_id,
      type: "deposit" as OperationType,
    }
    const { id: statement_id } = await createStatementUseCase.execute(deposit);

    await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });
  });

  it("should not be able get statement operation if user not exists", async () => {
    const data = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    };

    const { id: user_id } = await createUserUseCase.execute(data);

    const deposit = {
      description: "Deposit Test",
      amount: 400,
      user_id: user_id,
      type: "deposit" as OperationType,
    }
    const { id: statement_id } = await createStatementUseCase.execute(deposit);

    await expect(
      getStatementOperationUseCase.execute({
        user_id: "1234",
        statement_id,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able get statement operation if statement not exists", async () => {
    const data = {
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    };

    const { id: user_id } = await createUserUseCase.execute(data);

    const deposit = {
      description: "Deposit Test",
      amount: 400,
      user_id,
      type: "deposit" as OperationType,
    };

    await createStatementUseCase.execute(deposit);

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user_id as string,
        statement_id: "1234",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
