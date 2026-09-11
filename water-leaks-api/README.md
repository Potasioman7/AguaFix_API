# Water Leaks API

API en NestJS para que los ciudadanos reporten fugas de agua en la via publica.
Al crear un reporte, se guarda en PostgreSQL y se envia un correo de aviso a la
cuadrilla de mantenimiento con los datos de la fuga.

## Estructura

```
src/
  config/envs.ts             -> variables de entorno (env-var + dotenv)
  database/data-source.ts    -> DataSource de TypeORM para el CLI de migraciones
  migrations/                -> migraciones (synchronize: false)
  reports/
    entities/report.entity.ts     -> tabla WATER_REPORT
    dto/create-report.dto.ts
    templates/report.template.ts  -> generateReportTemplate(dto)
    reports.repository.ts
    reports.service.ts
    reports.controller.ts         -> POST /reports, GET /reports
    reports.module.ts
  users/
    entities/user.entity.ts       -> tabla SYSTEM_USER
    users.repository.ts
    users.module.ts
  auth/
    dto/create-user.dto.ts
    dto/login.dto.ts
    auth.service.ts
    auth.controller.ts            -> POST /auth/register, POST /auth/login
    auth.module.ts
  email/
    email.service.ts              -> transporter nodemailer + sendEmail(to, subject, template)
    email.module.ts
  app.module.ts
  main.ts
```

## Requisitos previos

- Node.js 18+
- PostgreSQL corriendo (local o en contenedor)
- Cuenta SMTP (Gmail con "app password", Mailtrap, SendGrid, etc.)

## Instalacion

```bash
npm install
```

## Configuracion

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Variables principales:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`
- `MAINTENANCE_CREW_EMAIL` (correo que recibe el aviso de cada fuga reportada)
- `BCRYPT_SALT_ROUNDS`

Todas se leen y validan con `env-var` en `src/config/envs.ts`; si falta alguna
requerida, la aplicacion falla al arrancar con un mensaje claro.

## Base de datos y migraciones

`synchronize` esta en `false`. El esquema se gestiona 100% con migraciones.

Crear la base de datos vacia (ejemplo con psql):

```bash
createdb water_leaks_db
```

Ejecutar las migraciones incluidas (crean WATER_REPORT y SYSTEM_USER):

```bash
npm run migration:run
```

Otros comandos disponibles:

```bash
# generar una migracion nueva a partir de cambios en las entidades
npm run migration:generate -- src/migrations/NombreDeLaMigracion

# revertir la ultima migracion
npm run migration:revert
```

## Levantar la aplicacion

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000` (o el `PORT` configurado).

## Endpoints

### Reportes de fuga

**POST /reports**

```json
{
  "address": "Av. Reforma 123, esquina con Insurgentes",
  "description": "Se observa un chorro de agua saliendo del pavimento",
  "severity": "high",
  "reporterPhone": "5512345678"
}
```

Guarda el reporte en `WATER_REPORT` y envia un correo HTML a
`MAINTENANCE_CREW_EMAIL` con la plantilla de `report.template.ts`.

**GET /reports**

Devuelve la lista de todos los reportes, mas recientes primero.

### Autenticacion

**POST /auth/register**

```json
{
  "name": "Ana Perez",
  "email": "ana@example.com",
  "password": "unaClaveSegura123",
  "isNotificationEnabled": true
}
```

La contrasena se hashea con `bcryptjs` antes de guardarse.

**POST /auth/login**

```json
{
  "email": "ana@example.com",
  "password": "unaClaveSegura123"
}
```

Si el correo no existe o la contrasena no coincide, responde
`400 Bad Request` con un mensaje claro ("Credenciales invalidas").

## Notas de diseno

- Arquitectura por capas dentro de cada modulo: `controller -> service -> repository`.
- Los DTOs validan la entrada de cada endpoint con `class-validator`
  (`whitelist` y `forbidNonWhitelisted` activados globalmente en `main.ts`).
- Si el guardado del reporte tiene exito pero el envio de correo falla, el
  reporte NO se pierde: el error solo queda registrado en el log, para no
  bloquear al ciudadano por un problema de SMTP.
