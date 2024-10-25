// consumer.js
import Kafka from 'node-rdkafka';
import eventType from '../eventType.js';

// Create Kafka Consumer
const consumer = new Kafka.KafkaConsumer({
  'group.id': 'kafka',
  'metadata.broker.list': 'kafka:9092',
}, {});

// Connect the consumer
consumer.connect();

// Handle the ready event
consumer.on('ready', () => {
  console.log('Consumer ready...');
  consumer.subscribe(['test']); // Subscribe to the 'test' topic
  consumer.consume(); // Start consuming messages
}).on('data', (data) => {
  const transaction = eventType.fromBuffer(data.value); // Decode the Avro-encoded message
  console.log(`Received transaction: ${JSON.stringify(transaction)}`);
  handleTransaction(transaction); // Process the received transaction
});

// Handle incoming transactions
function handleTransaction(transaction) {
  const { id, type, amount, accountId, timestamp } = transaction;

  if (type === 'deposit') {
    console.log(`Deposit of ${amount} to account ${accountId} at ${timestamp}`);
  } else if (type === 'withdraw_request') {
    console.log(`Withdraw request of ${amount} from account ${accountId} at ${timestamp}`);
  } else if (type === 'withdraw') {
    console.log(`Withdrawal of ${amount} from account ${accountId} at ${timestamp}`);
  } else {
    console.log('Unknown transaction type');
  }
}
