import request from 'supertest';
import api from './api';

describe('Health Check', () => {
  test('return healthy', async () => {
    const result = await request(api).get('/healthz');
    expect(result.status).toEqual(200);
  });
});

describe('Smoke tests', () => {
  test('has /heavy post route', async () => {
    const result = await request(api).post('/heavy').send({ number: 100 });
    expect(result.status).toEqual(200);
  });
});
