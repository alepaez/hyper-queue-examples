import redis, { ClientOpts } from 'redis';

const config = {
  'development': {
    redis: {
      host: process.env.REDIS_HOST! || "localhost",
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
    },
  },
}[process.env.NODE_ENV || 'development'];

export default config;

