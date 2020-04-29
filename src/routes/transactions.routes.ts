import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';

import Transactions from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionCustonRepository = getCustomRepository(
    TransactionsRepository,
  );
  const transactionRepository = await getRepository(Transactions).find({
    relations: ['category'],
  });

  const balance = await transactionCustonRepository.getBalance();

  return response.json({ transactionRepository, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const createTransaction = new CreateTransactionService();
  const { title, value, type, category } = request.body;

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.param;
  const transactionDelete = new DeleteTransactionService();
  await transactionDelete.execute(id);

  return response.status(204).send();
});

// transactionsRouter.post('/import', async (request, response) => {
//   // TODO
// });

export default transactionsRouter;
