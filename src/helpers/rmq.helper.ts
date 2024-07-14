export const RMQ_EXCHANGES = {
  JOBS: {
    name: 'jobs.candidation.result',
    type: 'fanout',
    options: {durable: true, alternateExchange: 'handler'},
    queues: {
      JOBS_CANDIDATION_RESULT: {
        name: 'jobs.candidation.result',
        routingKey: 'candidation.result',
        options: {durable: true},
      },
      JOBS_CANDIDATION_RESULT_MSG: {
        name: 'jobs.candidation.result.msg',
        routingKey: 'candidation.result',
        options: {durable: true},
      },
    },
  },
  MESSAGE: {
    name: 'message',
    type: 'topic',
    routingKey: '',
    options: {durable: true},
    queues: {
      SMS: {name: 'sms', routingKey: 'sms', options: {durable: true}},
    },
  },
};
