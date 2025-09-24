import Router from 'express-promise-router';

import { Request, Response } from 'express';
import {
  getConceptualProcessExport,
  getConceptualProcessTableContent,
} from '../controller/conceptual-process';

export const conceptionalProcessRouter = Router();

conceptionalProcessRouter.get(
  '/table-content',
  async (req: Request, res: Response) => {
    try {
      const filterOptions = getFilterOptionsFromRequest(req);
      const tableContent =
        await getConceptualProcessTableContent(filterOptions);

      res.set('X-Total-Count', tableContent.meta.count);
      return res.status(200).send(tableContent);
    } catch (error) {
      const message =
        error.message ??
        'An error occurred while getting inventory processes table content.';
      const statusCode = error.status ?? 500;
      return res.status(statusCode).send({ message });
    }
  },
);

conceptionalProcessRouter.get(
  '/download',
  async (req: Request, res: Response) => {
    try {
      const filterOptions = getFilterOptionsFromRequest(req);
      const csvString = await getConceptualProcessExport(filterOptions);
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename="processes.csv"');
      return res.status(200).send(csvString);
    } catch (error) {
      const message =
        error.message ??
        'An error occurred while downloading processes as a CSV file.';
      const statusCode = error.status ?? 500;
      return res.status(statusCode).send({ message });
    }
  },
);

const getFilterOptionsFromRequest = (request: Request) => {
  const params = request.query;
  return {
    sort: params.sort,
    page: params.page ? parseInt(params.page) : 0,
    size: params.size ? parseInt(params.size) : 20,
    categoryId: params.category,
    domainId: params.domain,
    groupId: params.group,
    title:
      params.processTitle && params.processTitle.trim() !== ''
        ? params.processTitle
        : null,
  };
};
