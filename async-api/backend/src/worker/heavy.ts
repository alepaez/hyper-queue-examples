import { promisify } from 'util';
import redis, { RedisClient } from 'redis';
import { Worker, Queue, Message } from 'hyperq';

const sleep = promisify(setTimeout);

export default (redisClient: RedisClient, queue: Queue): Worker => {
  const redisSet = promisify(redisClient.set).bind(redisClient);
  const redisExpire = promisify(redisClient.expire).bind(redisClient);

  const action = async (message: Message, w: Worker): Promise<void> => {
    const { requestID, waitFor } = JSON.parse(message.body);

    console.log(`Processing Request #${requestID}`);

    await sleep(waitFor);
    const responseKey = `responses-heavy-${requestID}`
    await redisSet(responseKey, JSON.stringify({ waited: `${waitFor}ms` }));
    await redisExpire(responseKey, 86400);

    await message.delete();
  };

  return new Worker(queue, action, {});
};
