import { promisify } from 'util';
import heavy from './heavy';
import redis, { RedisClient, ClientOpts } from 'redis';
import { Worker, MemoryQueue } from 'hyperq';

const redisOptions: ClientOpts = {
  host: "localhost",
  port: 6379,
  db: 0,
}
const redisClient: RedisClient = redis.createClient(redisOptions);
const redisFlushAll = promisify(redisClient.flushall).bind(redisClient);
const redisGet = promisify(redisClient.get).bind(redisClient);
const redisQuit = promisify(redisClient.quit).bind(redisClient);

beforeEach(async () => {
  await redisFlushAll();
});

afterAll(async () => {
  await redisQuit();
  await new Promise(resolve => setImmediate(resolve));
});

describe('Heavy worker', () => {
  test('write process response to redis', async () => {
    const requestID = "00000000000000000000000000000000";
    const queue = new MemoryQueue();
    const msgBody = { requestID, waitFor: 100 };

    await queue.push(JSON.stringify(msgBody));

    const worker: Worker = heavy(redisClient, queue);
    const run = worker.run();
    worker.exit();
    await run;

    const response = await redisGet('responses-heavy-00000000000000000000000000000000');
    expect(response).toEqual(JSON.stringify({
      waited: '100ms',
    }));
  });

  test('response key on redis must expire after 1 day (86400 seconds)', async () => {
    const requestID = "00000000000000000000000000000000";
    const queue = new MemoryQueue();
    const msgBody = { requestID, waitFor: 100 };

    await queue.push(JSON.stringify(msgBody));

    const expireSpy = jest.spyOn(redisClient, "expire");

    const worker: Worker = heavy(redisClient, queue);
    const run = worker.run();
    worker.exit();
    await run;

    expect(expireSpy).toBeCalledWith('responses-heavy-00000000000000000000000000000000', 86400, expect.any(Function));
  });
});
