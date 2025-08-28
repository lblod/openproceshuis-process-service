import Router from 'express-promise-router';

import { Request, Response } from 'express';
import { getConceptualProcessExport } from '../controller/conceptual-process';

export const processRouter = Router();

processRouter.get('/download', async (req: Request, res: Response) => {
  try {
    const filterOptions = {
      sort: req.query.sort,
      page: req.query.page,
      size: req.query.size,
    };

    const csvString = await getConceptualProcessExport(filterOptions);
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="processes.csv"');
    return res.status(200).send(csvString);
  } catch (error) {
    const message =
      error.message ??
      'An error occurred while downloading processes as a CSV file.';
    const statusCode = error.status ?? 500;
    return res.status(statusCode).send({ message });
  }
});
