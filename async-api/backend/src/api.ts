import express, { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import hyperq from 'hyperq'
import redis, { RedisClient, ClientOpts } from 'redis';

import heavy from './api/heavy';
import heavyQueue from './queues/heavy';

const redisOptions: ClientOpts = {
  host: "localhost",
  port: 6379,
  db: 0,
}
const redisClient: RedisClient = redis.createClient(redisOptions);

const app = express();

app.get('/healthz', (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

heavyQueue.build();

app.use(heavy(v4, heavyQueue, redisClient));

export default app;
