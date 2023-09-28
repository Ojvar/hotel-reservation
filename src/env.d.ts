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

    KEYCLOAK_ALLOWED_LIST: string;
    KEYCLOAK_REJECTED_LIST: string;
  }
}
