import express from 'express';
import request from 'supertest';
import hyperq, { Message } from 'hyperq';

import heavy from './heavy';

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
}

describe('Heavy API', () => {
  test('returns request ID', async () => {
    const {
      requestID,
      returnPath,
      generateUUID,
      queue,
    } = generateMocks();

    const api = express();
    api.use(heavy(generateUUID, queue));

    const result = await request(api)
      .post('/heavy')
      .send({ waitFor: 100 });

    expect(result.status).toEqual(200);
    expect(result.body).toEqual({
      requestID,
      returnPath,
    });
  })

  test('enqueue request with permitted parameters', async () => {
    const {
      requestID,
      returnPath,
      generateUUID,
      queue,
    } = generateMocks();

    const api = express();
    api.use(heavy(generateUUID, queue));

    const body = { waitFor: 100, notpermittedparam: 'h4ck3rl33t' };
    const expectedBody = { requestID, waitFor: 100 };
    const result = await request(api)
      .post('/heavy')
      .send(body);

    const msg: Message | undefined = await queue.pop();

    expect(msg).toBeDefined();
    expect(JSON.parse(msg?.body || "{}")).toEqual(expectedBody);
  })
});
