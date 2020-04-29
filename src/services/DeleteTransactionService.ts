import { getRepository } from 'typeorm';

import Transactions from '../models/Transaction';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(transactionsId: string): Promise<void> {
    const transactionsRepostiry = getRepository(Transactions);

    const transactionsExists = await transactionsRepostiry.findOne(
      transactionsId,
    );

    if (!transactionsExists) {
      throw new AppError('The transaction does not exist');
    }

    await transactionsRepostiry.remove(transactionsExists);
  }
}

export default DeleteTransactionService;
