import express, { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import hyperq from 'hyperq'

import heavy from './api/heavy';

const app = express();

const queue = new hyperq.MemoryQueue();

app.get('/healthz', (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

app.use(heavy(v4, queue));

export default app;
