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

    KEYCLOAK_ALLOWED_LIST: string;
    KEYCLOAK_REJECTED_LIST: string;

    TARGET_EWALLET_USER_ID: string;
    EWALLET_DS_BASE_URL: string;
  }
}
