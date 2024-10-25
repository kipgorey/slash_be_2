import express from 'express';
import bodyParser from 'body-parser';
import Kafka from 'node-rdkafka';
import mongoose from 'mongoose';
import eventType from '../eventType.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb://mongo:27017/banking';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 600,
  minPoolSize: 5,
  maxPoolSize: 100
});

// Mongoose schema for accounts
const accountSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, default: 0 },
  requestedWithdrawals: { type: Number, default: 0 } // New field to track requested withdrawals
}, { optimisticConcurrency: true });

const Account = mongoose.model('Account', accountSchema);

// Kafka Producer setup
const stream = Kafka.Producer.createWriteStream(
  {
    'metadata.broker.list': 'kafka:9092',
    'acks': 'all',
    'linger.ms': 5,
    'batch.size': 16384
  },
  {},
  {
    topic: 'test',
  }
);

stream.on('error', (err) => {
  console.error('Error in our Kafka stream');
  console.error(err);
});

// Helper function to update account balance atomically
const updateAccountBalance = async (accountId, amount) => {
  const account = await Account.findOneAndUpdate(
    { accountId },
    { $inc: { balance: amount } },
    { new: true, upsert: true }
  );
  return account.balance;
};

// Handle withdraw requests
const handleWithdrawRequest = async (accountId, amount, id, timestamp) => {
  // Validate input
  if (!accountId || amount == null || isNaN(amount) || !id || !timestamp) {
    throw new Error('Invalid input: accountId, amount, id, and timestamp are required');
  }

  // Fetch account details from the database
  const account = await Account.findOne({ accountId });
  const currentBalance = account ? account.balance : 0;
  const totalRequestedWithdrawals = account ? account.requestedWithdrawals : 0;

  // Check if the current balance is sufficient for the withdrawal request
  if (currentBalance < amount) {
    throw new Error('withdraw_request denied due to insufficient balance');
  }

  // Check if total requested withdrawals exceed current balance
  if (totalRequestedWithdrawals + amount > currentBalance) {
    throw new Error('withdraw_request denied due to total requested withdrawals exceeding available balance');
  }

  // Update total requested withdrawals in the database
  account.requestedWithdrawals += amount;
  await account.save();

  // Create an event object matching the Avro schema
  const eventData = {
    id,
    type: 'withdraw_request',
    amount,
    accountId,
    timestamp
  };

  // Convert event data to a buffer using Avro
  const buffer = eventType.toBuffer(eventData);
  if (!buffer) {
    throw new Error('Invalid data for Kafka stream');
  }

  // Write the event to the Kafka stream
  const writeSuccess = stream.write(buffer);
  if (!writeSuccess) {
    throw new Error('Failed to write to Kafka stream');
  }

  return 'withdraw_request approved';
};

// Endpoint to process a transaction
app.post('/transaction', async (req, res) => {
  const { id, type, amount, accountId, timestamp } = req.body;

  // Validate input
  if (!id || !type || !amount || !accountId || !timestamp) {
    return res.status(400).send({ error: 'Invalid input data' });
  }

  // Ensure type is valid
  const validTypes = ['deposit', 'withdraw_request', 'withdraw'];
  if (!validTypes.includes(type)) {
    return res.status(400).send({ error: 'Invalid transaction type' });
  }

  try {
    if (type === 'deposit') {
      const balance = await updateAccountBalance(accountId, amount);
      return res.status(200).send({ status: 'Deposit successful', balance });
    }

    if (type === 'withdraw_request') {
      try {
        const status = await handleWithdrawRequest(accountId, amount, id, timestamp);
        return res.status(201).send({ status });
      } catch (error) {
        return res.status(402).send({ error: error.message });
      }
    }

    if (type === 'withdraw') {
      // Fetch account details from the database
      const account = await Account.findOne({ accountId });
      if (!account) {
        return res.status(404).send({ error: 'Account not found' });
      }
    
      // Check if the amount to withdraw is less than or equal to requested withdrawals
      if (amount <= account.requestedWithdrawals) {
        // Deduct amount from both balance and requested withdrawals
        account.balance -= amount;
        account.requestedWithdrawals -= amount;
    
        // Save changes to the account
        await account.save();
    
        // Create withdraw event and send to Kafka
        const eventData = {
          id,
          type: 'withdraw',
          amount,
          accountId,
          timestamp
        };
    
        const buffer = eventType.toBuffer(eventData);
        if (!buffer) {
          return res.status(400).send({ error: 'Invalid data for Kafka stream' });
        }
        const writeSuccess = stream.write(buffer);
        if (!writeSuccess) {
          return res.status(500).send({ error: 'Failed to write to Kafka stream' });
        }
    
        return res.status(200).send({ status: 'Withdraw successful', balance: account.balance });
      } else {
        // Amount to withdraw is greater than requested withdrawals
        // Check if the withdrawal amount exceeds the account balance
        if (amount > account.balance) {
          return res.status(402).send({ error: 'Withdraw denied due to insufficient funds' });
        }
    
        // Deduct requested withdrawals to zero and subtract from account balance
        account.requestedWithdrawals = 0; // Set requested withdrawals to zero
        account.balance -= amount; // Deduct the full amount from the balance
    
        // Save changes to the account
        await account.save();
    
        // Create withdraw event and send to Kafka
        const eventData = {
          id,
          type: 'withdraw',
          amount,
          accountId,
          timestamp
        };
    
        const buffer = eventType.toBuffer(eventData);
        if (!buffer) {
          return res.status(400).send({ error: 'Invalid data for Kafka stream' });
        }
        const writeSuccess = stream.write(buffer);
        if (!writeSuccess) {
          return res.status(500).send({ error: 'Failed to write to Kafka stream' });
        }
    
        return res.status(200).send({ status: 'Withdraw successful', balance: account.balance });
      }
    } 
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

// Endpoint to get account balance
app.get('/account/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const account = await Account.findOne({ accountId });
  const balance = account ? account.balance : 0;
  res.status(200).send({ accountId, balance });
});

// Start the API server
app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});
