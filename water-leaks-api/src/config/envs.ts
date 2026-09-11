import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  // App
  port: env.get('PORT').default(3000).asPortNumber(),

  // Database
  dbHost: env.get('DB_HOST').required().asString(),
  dbPort: env.get('DB_PORT').default(5432).asPortNumber(),
  dbUsername: env.get('DB_USERNAME').required().asString(),
  dbPassword: env.get('DB_PASSWORD').required().asString(),
  dbName: env.get('DB_NAME').required().asString(),

  // Mail
  mailHost: env.get('MAIL_HOST').required().asString(),
  mailPort: env.get('MAIL_PORT').default(587).asPortNumber(),
  mailSecure: env.get('MAIL_SECURE').default('false').asBool(),
  mailUser: env.get('MAIL_USER').required().asString(),
  mailPassword: env.get('MAIL_PASSWORD').required().asString(),
  mailFrom: env.get('MAIL_FROM').required().asString(),

  // Cuadrilla de mantenimiento
  maintenanceCrewEmail: env.get('MAINTENANCE_CREW_EMAIL').required().asString(),

  // Bcrypt
  bcryptSaltRounds: env.get('BCRYPT_SALT_ROUNDS').default(10).asIntPositive(),
};
