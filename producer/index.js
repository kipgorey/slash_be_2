// producer.js
import Kafka from 'node-rdkafka';
import eventType from '../eventType.js';

// Kafka Producer Stream Configuration
const stream = Kafka.Producer.createWriteStream({
  'metadata.broker.list': 'kafka:9092'
}, {}, {
  topic: 'test'
});

// Handle Kafka Stream Errors
stream.on('error', (err) => {
  console.error('Error in our Kafka stream');
  console.error(err);
});

// Function to queue a transaction event
export function queueTransaction(transaction) {
  const success = stream.write(eventType.toBuffer(transaction)); // Send to Kafka

  if (success) {
    console.log(`Transaction queued: ${JSON.stringify(transaction)}`);
  } else {
    console.log('Too many messages in the queue, waiting for drain...');
    stream.once('drain', () => queueTransaction(transaction)); // Retry when the stream is drained
  }
}

// Export the stream for use in other modules
export default stream;
