declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;

    SERVER_URL: string;
    BASE_PATH: string;
    HTTPS: string;
    SSL_KEY: string;
    SSL_CERT: string;

    SENTRY_DSN: string;
    SENTRY_SAMPLE_RATE: string;
    SENTRY_PROFILES_SAMPLE_RATE: string;

    QENG_DB_URL: string;
    QENG_DB_HOST: string;
    QENG_DB_PORT: string;
    QENG_DB_USER: string;
    QENG_DB_PASSWORD: string;
    QENG_DB_DATABASE: string;

    SQL_DB_USER: string;
    SQL_DB_PASSWORD: string;
    SQL_DB_DOMAIN: string;
    SQL_DB_INTERGRATED_SECURITY: string;
    SQL_DB_DATABASE: string;
    SQL_DB_HOST: string;
    SQL_DB_PORT: string;

    REDIS_URL: string;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
    REDIS_NAME: string;
    REDIS_DATABASE: string;
    REDIS_SOCKET_HOST: string;
    REDIS_SOCKET_PORT: string;
    REDIS_EXPIER_TIME: string;

    RABBITMQ_PROTOCOL: string;
    RABBITMQ_HOST: string;
    RABBITMQ_PORT: string;
    RABBITMQ_USER: string;
    RABBITMQ_PASS: string;
    RABBITMQ_VHOST: string;

    KEYCLOAK_ALLOWED_LIST: string;
    KEYCLOAK_REJECTED_LIST: string;

    PROFILE_SERVICE_BASE_URL: string;
    AUTH_SERVICE_BASE_URL: string;
    FILE_SERVICE_BASE_URL: string;
    PUSH_NOTIFICATION_SERVICE_BASE_URL: string;

    PRJ_MGR_MAX_ATTACHMENTS_ITEM_COUNT: string;
    PRJ_MGR_PUSH_NOTIF: string;
    PRJ_MGR_SEND_SMS: string;
    PRJ_MSG_VERIFICATION_SMS_EXPIRE_TIME: string;
    PRJ_MSG_PROJECT_REGISTRATION_TITLE: string;
  }
}
