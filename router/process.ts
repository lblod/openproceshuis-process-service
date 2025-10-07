import Router from 'express-promise-router';

import { Request, Response } from 'express';
import { getProcessUsageCountOverOrganizations } from '../controller/process';

export const processRouter = Router();

processRouter.get(
  '/:id/count-of-users',
  async (req: Request, res: Response) => {
    try {
      const count = await getProcessUsageCountOverOrganizations(req.params.id);

      return res.status(200).send({ count });
    } catch (error) {
      const message =
        error.message ??
        'An error occurred while getting inventory processes table content.';
      const statusCode = error.status ?? 500;
      return res.status(statusCode).send({ message });
    }
  },
);
