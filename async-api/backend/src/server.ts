import api from './api';

const server = api.listen(3000, () => { console.log("API Server - Started") });

const exit = () => {
  console.log('API Server - Terminating...');
  server.close(() => {
    console.log('API Server - Closed');
    process.exit(0);
  });
}

process.on('SIGTERM', exit);
process.on('SIGINT', exit);

