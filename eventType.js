import avro from 'avsc';

export default avro.Type.forSchema({
  type: 'record',
  fields: [
    {
      name: 'id',
      type: 'string',
    },
    {
      name: 'type',
      type: { type: 'enum', symbols: ['deposit', 'withdraw_request', 'withdraw'] }
    },
    {
      name: 'amount',
      type: 'double',
    },
    {
      name: 'accountId',
      type: 'string',
    },
    {
      name: 'timestamp',
      type: 'string', // ISO timestamp in string format
    }
  ]
});
