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
    let idNewCategory = '';

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Withdrawal types and invalid entries');
    }

    const balaceTotal = await (await transactionCustonRespository.getBalance())
      .total;

    if (value > balaceTotal) {
      throw new AppError('Insufficient funds', 401);
    }

    const categoryExists = await categoryRespository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      const newCategory = categoryRespository.create({ title: category });
      await categoryRespository.save(newCategory);
      idNewCategory = newCategory.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists ? categoryExists.id : idNewCategory,
    });

    await transactionRespository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
