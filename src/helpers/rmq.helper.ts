/* eslint-disable @typescript-eslint/naming-convention */
export const RMQ_EXCHANGES = {
  JOBS: {
    name: 'jobs',
    type: 'topic',
    route_key: '',
    queues: {
      JOBS_CANDIDATION_RESULT: {
        name: 'jobs.candidation.result',
        route_key: 'candidation.result',
      },
    },
  },
  MESSAGE: {
    name: 'message',
    type: 'topic',
    route_key: '',
    queues: {SMS: {name: 'sms', route_key: 'sms'}},
  },
};
