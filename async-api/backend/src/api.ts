import express, { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import hyperq from 'hyperq'

import heavy from './api/heavy';
import heavyQueue from './queues/heavy';

const app = express();

app.get('/healthz', (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

heavyQueue.build();

app.use(heavy(v4, heavyQueue));

export default app;
