import { OperationType } from "../../../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../../modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { TransferAmountUseCase } from "./TransferAmountUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let transferAmountUseCase: TransferAmountUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Transfer Amount", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    transferAmountUseCase = new TransferAmountUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to transfer amount", async () => {
    const sender = await createUserUseCase.execute({
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    await createStatementUseCase.execute({
      description: "Depósito",
      amount: 2500,
      type: "deposit" as OperationType,
      user_id: sender.id,
    });

    const user = await createUserUseCase.execute({
      name: "Luana Maria",
      email: "luana@gmail.com",
      password: "12345",
    });

    const transfer = await transferAmountUseCase.execute({
      description: "Transfêrencia",
      amount: 1500,
      user_id: user.id,
      sender_id: sender.id,
    });

    expect(transfer).toHaveProperty("id");
    expect(transfer).toHaveProperty("user_id");
    expect(transfer).toHaveProperty("sender_id");
    expect(transfer).toHaveProperty("description");
    expect(transfer).toHaveProperty("amount");
    expect(transfer).toHaveProperty("type");
  });

  it("should not be able to transfer amount if insufficient funds", async () => {
    const sender = await createUserUseCase.execute({
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    await createStatementUseCase.execute({
      description: "Depósito",
      amount: 2500,
      type: "deposit" as OperationType,
      user_id: sender.id,
    });

    const user = await createUserUseCase.execute({
      name: "Luana Maria",
      email: "luana@gmail.com",
      password: "12345",
    });

    expect(async () => {
      await transferAmountUseCase.execute({
        description: "Transfêrencia",
        amount: 3000,
        user_id: user.id,
        sender_id: sender.id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to transfer amount if user not exists", async () => {
    const sender = await createUserUseCase.execute({
      name: "Jhonatan",
      email: "jhonatan@gmail.com",
      password: "12345"
    });

    await createStatementUseCase.execute({
      description: "Depósito",
      amount: 2500,
      type: "deposit" as OperationType,
      user_id: sender.id,
    });

    const user = await createUserUseCase.execute({
      name: "Luana Maria",
      email: "luana@gmail.com",
      password: "12345",
    });

    expect(async () => {
      await transferAmountUseCase.execute({
        description: "Transfêrencia",
        amount: 3000,
        sender_id: sender.id,
        user_id: "ab5bc2b5-dbd1-4f5a-8d85-b14e64943263",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
