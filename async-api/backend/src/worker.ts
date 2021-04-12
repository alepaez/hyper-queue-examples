import heavy from './worker/heavy';
import redis, { RedisClient, ClientOpts } from 'redis';

import heavyQueue from './queues/heavy';

const redisOptions: ClientOpts = {
  host: "localhost",
  port: 6379,
  db: 0,
}
const redisClient: RedisClient = redis.createClient(redisOptions);

const worker = heavy(redisClient, heavyQueue);

const start: () => void = async () => {
  await heavyQueue.build();

  const exit = () => {
    worker.exit();
    console.log('Worker - Heavy API - Exiting...');
  }

  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  console.log('Worker - Heavy API - Running...')
  await worker.run();
  process.exit(0);
};

start();

