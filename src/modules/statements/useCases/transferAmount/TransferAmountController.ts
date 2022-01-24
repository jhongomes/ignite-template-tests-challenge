import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferAmountUseCase } from "./TransferAmountUseCase";

class TransferAmountController {
  async execute(req: Request, res: Response): Promise<Response> {
    const { description, amount } = req.body;
    const { user_id } = req.params;
    const { id: sender_id } = req.user;

    const transferAmountUseCase = container.resolve(TransferAmountUseCase);

    const transfer = await transferAmountUseCase.execute({
      description,
      amount,
      sender_id,
      user_id,
    });

    return res.status(200).json(transfer);
  }
}

export { TransferAmountController };
