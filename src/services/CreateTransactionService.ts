import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestExrc {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestExrc): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRespository = getRepository(Category);
    const transactionCustonRespository = getCustomRepository(
      TransactionsRepository,
    );

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Withdrawal types and invalid entries');
    }

    const balaceTotal = await transactionCustonRespository.getBalance();

    if (value > balaceTotal.total && type === 'outcome') {
      throw new AppError('Insufficient funds', 400);
    }

    let categoryExists = await categoryRespository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRespository.create({ title: category });
      await categoryRespository.save(categoryExists);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryExists,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
