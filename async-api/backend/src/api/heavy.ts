import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import hyperq, { Queue } from 'hyperq';

export default (uuidGenerator: () => string, queue: Queue) => {
  const router = express.Router();

  router.use(bodyParser.json());

  router.post('/heavy', async (req: Request, res: Response, next: NextFunction) => {
    const requestID = uuidGenerator();
    const returnPath = `/heavy/response/${requestID}`;

    const { waitFor } = req.body;

    await queue.push(JSON.stringify({ requestID, waitFor }));

    res.send({ requestID, returnPath });
  });

  return router;
};
