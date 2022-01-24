import {
  OperationType,
  Statement,
} from "../../../../modules/statements/entities/Statement";
import { IStatementsRepository } from "../../../../modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "../../../../modules/users/repositories/IUsersRepository";
import { CreateUserError } from "../../../../modules/users/useCases/createUser/CreateUserError";
import { inject, injectable } from "tsyringe";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { AppError } from "../../../../shared/errors/AppError";

interface IRequest {
  description: string;
  amount: number;
  user_id: string;
  sender_id: string;
}

@injectable()
class TransferAmountUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    description,
    amount,
    sender_id,
    user_id,
  }: IRequest): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (!user) throw new CreateStatementError.UserNotFound();

    if (amount > balance) throw new CreateStatementError.InsufficientFunds();

    if (sender_id === user_id)
      throw new AppError("You cannot make transfers to yourself");

    const transfer = await this.statementsRepository.create({
      amount,
      description,
      type: "transfer" as OperationType,
      user_id,
      sender_id,
    });

    return transfer;
  }
}

export { TransferAmountUseCase };
