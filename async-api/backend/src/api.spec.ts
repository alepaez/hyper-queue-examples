import request from 'supertest';
import api from './api';
import heavyQueue from './queues/heavy';

describe('Health Check', () => {
  test('return healthy', async () => {
    const result = await request(api).get('/healthz');
    expect(result.status).toEqual(200);
  });
});

describe('Smoke tests', () => {
  test('has /heavy post route', async () => {
    await heavyQueue.build();
    const result = await request(api).post('/heavy').send({ waitFor: 100 });
    expect(result.status).toEqual(200);
  });
});
