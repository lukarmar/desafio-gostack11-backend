import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionCsv {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePah: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const transactions: TransactionCsv[] = [];
    const categories: string[] = [];

    const contactsReadStream = fs.createReadStream(filePah);
    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoriesExists = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const titleCategoriesExists = categoriesExists.map(
      (category: Category) => category.title,
    );

    const addNewCategoryTitles = categories
      .filter(category => !titleCategoriesExists.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addNewCategoryTitles.map(title => ({ title })),
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...categoriesExists];

    // Lembrando que o que teho que retornar para adcionar ao create,
    // são dados do tipo Cateroy
    const createdTransactions = transactionRepository.create(
      transactions.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category: finalCategories.find(categ => categ.title === category),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(filePah);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
