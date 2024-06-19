/* eslint-disable @typescript-eslint/naming-convention */
export const RMQ_EXCHANGES = {
  MESSAGE: {
    name: 'message',
    type: 'topic',
    route_key: '',
    queues: {SMS: {name: 'sms', route_key: 'sms'}},
  },
};
