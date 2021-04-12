import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSQueue } from 'hyperq-sqs';

const sqs = new SQSClient({
  region: "us-east-1",
  endpoint: 'http://localhost:4566',
});

export default new SQSQueue(sqs, 'heavy-api');

