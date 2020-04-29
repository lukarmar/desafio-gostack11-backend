import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const totalIncome = await (
      await this.find({ where: { type: 'income' } })
    ).reduce((total, { value }) => {
      return total + value;
    }, 0);
    const totalOutcome = await (
      await this.find({ where: { type: 'outcome' } })
    ).reduce((total, { value }) => {
      return total + value;
    }, 0);

    return {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };
  }
}

export default TransactionsRepository;
