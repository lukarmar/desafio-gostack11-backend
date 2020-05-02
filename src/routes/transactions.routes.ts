import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import Transactions from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionCustonRepository = getCustomRepository(
    TransactionsRepository,
  );
  const transactionRepository = getRepository(Transactions);
  const transactions = await transactionRepository.find();
  const balance = await transactionCustonRepository.getBalance();
  return response.json({ transactions, balance });
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
  const { id } = request.params;
  const transactionDelete = new DeleteTransactionService();
  await transactionDelete.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const transactionImportService = new ImportTransactionsService();
    const importTransaction = await transactionImportService.execute(
      request.file.path,
    );

    response.json(importTransaction);
  },
);

export default transactionsRouter;
