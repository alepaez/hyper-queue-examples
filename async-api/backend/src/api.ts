import express, { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import hyperq from 'hyperq'
import redis, { RedisClient, ClientOpts } from 'redis';
import cors from 'cors';

import config from './config';

import heavy from './api/heavy';
import heavyQueue from './queues/heavy';

const redisConfig: ClientOpts = config?.redis!;
const redisClient: RedisClient = redis.createClient(redisConfig);

const app = express();

app.use(cors());

app.get('/healthz', (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

heavyQueue.build();

app.use(heavy(v4, heavyQueue, redisClient));

export default app;
