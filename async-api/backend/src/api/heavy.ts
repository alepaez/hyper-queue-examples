import { promisify } from 'util';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import hyperq, { Queue } from 'hyperq';
import redis, { RedisClient } from 'redis';

export default (uuidGenerator: () => string, queue: Queue, redisClient: RedisClient) => {
  const router = express.Router();

  const redisGet = promisify(redisClient.get).bind(redisClient);
  const redisSet = promisify(redisClient.set).bind(redisClient);

  router.use(bodyParser.json());

  router.post('/heavy', async (req: Request, res: Response, next: NextFunction) => {
    const requestID = uuidGenerator();
    const returnPath = `/heavy/response/${requestID}`;
    const responseKey = `responses-heavy-${requestID}`

    const { waitFor } = req.body;

    await redisSet(responseKey, JSON.stringify({ status: 'pending' }));
    await queue.push(JSON.stringify({ requestID, waitFor }));

    res.send({ requestID, returnPath });
  });

  router.get('/heavy/response/:requestID', async (req: Request, res: Response, next: NextFunction) => {
    const { requestID } = req.params;
    const responseKey = `responses-heavy-${requestID}`
    const response = await redisGet(responseKey);

    if(!response) { return res.status(404).send({ error: 'Not Found' }) };

    res.send(JSON.parse(response));
  });

  return router;
};
