import { promisify } from 'util';
import express from 'express';
import request from 'supertest';
import hyperq, { Message } from 'hyperq';
import redis, { RedisClient, ClientOpts } from 'redis';

import heavy from './heavy';

const redisOptions: ClientOpts = {
  host: "localhost",
  port: 6379,
  db: 0,
};

const redisClient: RedisClient = redis.createClient(redisOptions);
const redisFlushAll = promisify(redisClient.flushall).bind(redisClient);
const redisQuit = promisify(redisClient.quit).bind(redisClient);
const redisSet = promisify(redisClient.set).bind(redisClient);
const redisGet = promisify(redisClient.get).bind(redisClient);

const generateMocks = () => {
  const requestID = '00000000000000000000000000000000';
  const returnPath = '/heavy/response/00000000000000000000000000000000';
  const generateUUID = () => requestID;
  const queue = new hyperq.MemoryQueue();
  return {
    requestID,
    returnPath,
    generateUUID,
    queue,
  }
};

beforeEach(async () => {
  await redisFlushAll();
});

afterAll(async () => {
  await redisQuit();
  await new Promise(resolve => setImmediate(resolve));
});

describe('Heavy API', () => {
  describe('POST /heavy', () => {
    test('returns request ID', async () => {
      const {
        requestID,
        returnPath,
        generateUUID,
        queue,
      } = generateMocks();

      const api = express();
      api.use(heavy(generateUUID, queue, redisClient));

      const result = await request(api)
        .post('/heavy')
        .send({ waitFor: 100 });

      expect(result.status).toEqual(200);
      expect(result.body).toEqual({
        requestID,
        returnPath,
      });
    });

    test('enqueue request with permitted parameters', async () => {
      const {
        requestID,
        returnPath,
        generateUUID,
        queue,
      } = generateMocks();

      const api = express();
      api.use(heavy(generateUUID, queue, redisClient));

      const body = { waitFor: 100, notpermittedparam: 'h4ck3rl33t' };
      const expectedBody = { requestID, waitFor: 100 };
      const result = await request(api)
        .post('/heavy')
        .send(body);

      const msg: Message | undefined = await queue.pop();

      expect(msg).toBeDefined();
      expect(JSON.parse(msg?.body || "{}")).toEqual(expectedBody);
    });

    test('saves request on redis with pending status', async () => {
      const {
        requestID,
        returnPath,
        generateUUID,
        queue,
      } = generateMocks();

      const api = express();
      api.use(heavy(generateUUID, queue, redisClient));

      const result = await request(api)
        .post('/heavy')
        .send({ waitFor: 100 });

      const requestOnRedis = await redisGet('responses-heavy-00000000000000000000000000000000');

      expect(requestOnRedis).toEqual(JSON.stringify({ status: 'pending' }));
    });
  });

  describe('GET /heavy/response/:requestID', () => {
    it('respond 404 when request id is invalid', async () => {
      const {
        requestID,
        returnPath,
        generateUUID,
        queue,
      } = generateMocks();

      const api = express();
      api.use(heavy(generateUUID, queue, redisClient));

      const result = await request(api)
        .get(`/heavy/response/${requestID}`);

      expect(result.status).toEqual(404);
    });

    it('respond 200 with saved response when request is valid', async () => {
      const {
        requestID,
        returnPath,
        generateUUID,
        queue,
      } = generateMocks();

      await redisSet('responses-heavy-00000000000000000000000000000000', JSON.stringify({ waited: '200ms' }));

      const api = express();
      api.use(heavy(generateUUID, queue, redisClient));

      const result = await request(api)
        .get(`/heavy/response/${requestID}`);

      expect(result.status).toEqual(200);
      expect(result.body).toEqual({
        waited: '200ms'
      });
    });
  });
});
