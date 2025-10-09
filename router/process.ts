import Router from 'express-promise-router';

import { Request, Response } from 'express';
import { getOrganizationsUsingProcess } from '../controller/process';

export const processRouter = Router();

processRouter.get(
  '/:id/organizational-usage',
  async (req: Request, res: Response) => {
    try {
      const usage = await getOrganizationsUsingProcess(req.params.id);

      return res.status(200).send(
        usage.map((usage) => {
          return {
            organizationId: usage.id,
            label: usage.label,
            type: usage.type,
          };
        }),
      );
    } catch (error) {
      const message =
        error.message ??
        'An error occurred while getting inventory processes table content.';
      const statusCode = error.status ?? 500;
      return res.status(statusCode).send({ message });
    }
  },
);
