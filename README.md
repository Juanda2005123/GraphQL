# 🏢 Real Estate API - NestJS

API REST para gestión inmobiliaria con autenticación JWT, roles (superadmin/agente) y operaciones CRUD sobre usuarios, propiedades y tareas.

## 👥 Autores

- **Juan Esteban Ruiz**
- **Juan David Quintero**
- **Juan Andrés Cano**

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Testing](#-testing)
- [Endpoints](#-endpoints)
- [Documentación API](#-documentación-api)
- [Despliegue](#-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 📖 Descripción

Sistema completo de gestión inmobiliaria que permite a agentes y superadministradores gestionar propiedades y tareas asociadas. El sistema incluye:

- **Autenticación JWT** con roles diferenciados
- **Autorización basada en roles** (superadmin, agent)
- **Soft deletes** en todas las entidades
- **Relaciones complejas** entre usuarios, propiedades y tareas
- **Testing completo** (94.34% de cobertura)
- **Documentación interactiva** con Swagger

---

## ✨ Características

### Funcionalidades Principales

- ✅ **Autenticación y Autorización**
  - Registro de nuevos agentes
  - Login con JWT
  - Roles diferenciados (superadmin, agent)
  - Guards personalizados para protección de rutas

- ✅ **Gestión de Usuarios**
  - CRUD completo de usuarios
  - Perfil de usuario autenticado
  - Soft delete de cuentas
  - Solo superadmin puede gestionar usuarios

- ✅ **Gestión de Propiedades**
  - Endpoints públicos (sin autenticación)
  - Agentes crean propiedades (auto-asignación como owner)
  - Agentes solo modifican sus propias propiedades
  - Superadmin gestiona todas las propiedades
  - Soft delete con cascada a tareas

- ✅ **Gestión de Tareas**
  - Tareas asociadas a propiedades
  - Agentes solo ven/modifican tareas de sus propiedades
  - Superadmin gestiona todas las tareas
  - Asignación automática de tareas

### Características Técnicas

- ✅ **Base de Datos PostgreSQL** con TypeORM
- ✅ **Seed automático** con datos iniciales
- ✅ **Validación de datos** con class-validator
- ✅ **Testing** unitario y E2E (94.34% coverage)
- ✅ **CI/CD** con GitHub Actions
- ✅ **Documentación Swagger** completa con ejemplos
- ✅ **Soft deletes** en todas las entidades

---

## 🛠 Tecnologías

### Backend
- **NestJS** v11.0.1 - Framework Node.js
- **TypeScript** v5.6.2
- **Node.js** v20.x

### Base de Datos
- **PostgreSQL** v14+
- **TypeORM** v0.3.20 - ORM
- **Docker** - Para PostgreSQL en desarrollo

### Autenticación
- **Passport JWT** v10.0.1
- **bcrypt** v5.1.1 - Hash de passwords

### Testing
- **Jest** - Testing unitario
- **Supertest** - Testing E2E/integración

### Documentación
- **Swagger/OpenAPI** v8.0.7

### DevOps
- **GitHub Actions** - CI/CD
- **Docker Compose** - Orquestación de contenedores

---

## 📦 Requisitos Previos

- **Node.js** v20.x o superior
- **npm** v10.x o superior
- **Docker** y **Docker Compose** (para base de datos)
- **Git**

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd nestJS
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto de la aplicación
PORT=3001

# Configuración de PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=inmobiliaria_db

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion
JWT_EXPIRATION=1d
```

### 4. Iniciar la base de datos

```bash
docker-compose up -d
```

Verifica que el contenedor esté corriendo:

```bash
docker ps
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto de la aplicación | `3001` |
| `POSTGRES_HOST` | Host de PostgreSQL | `localhost` |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `postgres123` |
| `POSTGRES_DB` | Nombre de la base de datos | `inmobiliaria_db` |
| `JWT_SECRET` | Secret para firmar JWT | `tu_secreto` |
| `JWT_EXPIRATION` | Tiempo de expiración del JWT | `1d` |

---

## 🎯 Ejecución

### Desarrollo (con hot-reload)

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3001`

### Producción

```bash
# Build
npm run build

# Ejecutar
npm run start:prod
```

### Acceder a la aplicación

- **API Base URL:** `http://localhost:3001/api`
- **Documentación Swagger:** `http://localhost:3001/api/docs`

### Seed de Datos Iniciales

El seed se ejecuta automáticamente al iniciar la aplicación. Crea:

- **Superadmin:** `admin@example.com` / `admin1234`
- **Agente 1:** `agent@example.com` / `agent1234`
- **Agente 2:** `agent.lisa@example.com` / `agentlisa1234`
- Propiedades y tareas de ejemplo

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test
```

### Tests E2E (Integración)

```bash
npm run test:e2e
```

### Cobertura de Código

```bash
npm run test:cov
```

El reporte HTML se generará en `coverage/lcov-report/index.html`

### Resultados Actuales

```
Test Suites: 18 passed, 18 total
Tests:       229 passed, 229 total
Coverage:    94.34% Statements | 79.07% Branches | 84.29% Functions | 95.29% Lines
```

✅ **Coverage superior al 80% requerido**

---

## 📚 Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo agente | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/logout` | Cerrar sesión | Sí |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/users/me` | Obtener perfil actual | agent, superadmin |
| PUT | `/users/me` | Actualizar perfil | agent, superadmin |
| DELETE | `/users/me` | Eliminar cuenta | agent, superadmin |
| POST | `/users` | Crear usuario | superadmin |
| GET | `/users` | Listar usuarios | superadmin |
| GET | `/users/:id` | Obtener usuario | superadmin |
| PUT | `/users/:id` | Actualizar usuario | superadmin |
| DELETE | `/users/:id` | Eliminar usuario | superadmin |

### Propiedades (`/api/properties`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/properties` | Listar propiedades | No |
| GET | `/properties/:id` | Obtener propiedad | No |
| POST | `/properties/agent` | Crear propiedad (agente) | agent |
| PUT | `/properties/agent/:id` | Actualizar propia propiedad | agent |
| DELETE | `/properties/agent/:id` | Eliminar propia propiedad | agent |
| POST | `/properties/admin` | Crear propiedad (admin) | superadmin |
| PUT | `/properties/admin/:id` | Actualizar cualquier propiedad | superadmin |
| DELETE | `/properties/admin/:id` | Eliminar cualquier propiedad | superadmin |

### Tareas (`/api/tasks`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/tasks/agent` | Listar tareas propias | agent |
| POST | `/tasks/agent` | Crear tarea | agent |
| GET | `/tasks/agent/:id` | Obtener tarea propia | agent |
| GET | `/tasks/agent/property/:propertyId` | Tareas por propiedad | agent |
| PUT | `/tasks/agent/:id` | Actualizar tarea propia | agent |
| DELETE | `/tasks/agent/:id` | Eliminar tarea propia | agent |
| GET | `/tasks/admin` | Listar todas las tareas | superadmin |
| POST | `/tasks/admin` | Crear tarea | superadmin |
| GET | `/tasks/admin/:id` | Obtener cualquier tarea | superadmin |
| GET | `/tasks/admin/property/:propertyId` | Tareas por propiedad | superadmin |
| PUT | `/tasks/admin/:id` | Actualizar cualquier tarea | superadmin |
| DELETE | `/tasks/admin/:id` | Eliminar cualquier tarea | superadmin |

---

## 📖 Documentación API

### Swagger UI

Accede a la documentación interactiva en:

```
http://localhost:3001/api/docs
```

Características de la documentación:
- ✅ Todos los endpoints documentados
- ✅ Ejemplos de Request/Response
- ✅ Autenticación Bearer JWT integrada
- ✅ Pruebas interactivas de endpoints
- ✅ Schemas de DTOs con ejemplos

### Colección de Postman

Importa la colección desde: `postman/Inmobiliaria NestJS.postman_collection.json`

---

## 🚀 Despliegue

### GitHub Actions CI/CD

El proyecto incluye workflows de GitHub Actions:

**Test Workflow** (`.github/workflows/test.yml`):
- ✅ Ejecuta linter
- ✅ Ejecuta tests unitarios
- ✅ Ejecuta tests E2E
- ✅ Genera reporte de coverage

**Se ejecuta en:**
- Push a `main` o `develop`
- Pull requests a `main`

### Despliegue en Producción

(Documentación completa en el informe)

**Plataformas recomendadas:**
- Railway
- Render
- Heroku

---

## 📁 Estructura del Proyecto

```
nestJS/
├── src/
│   ├── auth/                 # Módulo de autenticación
│   │   ├── dtos/            # DTOs de auth
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── users/               # Módulo de usuarios
│   │   ├── dtos/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.model.ts
│   ├── properties/          # Módulo de propiedades
│   │   ├── dtos/
│   │   ├── property.controller.ts
│   │   ├── property.service.ts
│   │   └── property.model.ts
│   ├── tasks/               # Módulo de tareas
│   │   ├── dtos/
│   │   ├── task.controller.ts
│   │   ├── task.service.ts
│   │   └── task.model.ts
│   ├── database/            # Configuración de DB
│   ├── seed/                # Seed de datos
│   ├── app.module.ts
│   └── main.ts
├── test/                    # Tests E2E
│   ├── auth.e2e-spec.ts
│   ├── users.e2e-spec.ts
│   ├── properties.e2e-spec.ts
│   ├── tasks.e2e-spec.ts
│   └── test-utils.ts
├── .github/
│   └── workflows/           # GitHub Actions
├── postman/                 # Colección de Postman
├── coverage/                # Reportes de coverage
├── docker-compose.yml       # PostgreSQL container
├── package.json
└── README.md
```

---

## 👥 Roles y Permisos

### Superadmin
- ✅ Acceso total a todos los recursos
- ✅ Crear, editar, eliminar usuarios
- ✅ Gestionar todas las propiedades
- ✅ Gestionar todas las tareas
- ✅ Asignar owners a propiedades

### Agent
- ✅ Gestionar su propio perfil
- ✅ Crear propiedades (auto-asignación como owner)
- ✅ Solo editar/eliminar sus propias propiedades
- ✅ Crear tareas en sus propiedades
- ✅ Solo ver/editar tareas de sus propiedades
- ❌ No puede gestionar otros usuarios

---

## 🔐 Autenticación

### Flujo de Autenticación

1. **Registro:** POST `/api/auth/register` → Usuario se registra como `agent`
2. **Login:** POST `/api/auth/login` → Recibe JWT token
3. **Uso del token:** Incluir en header `Authorization: Bearer <token>`
4. **Rutas protegidas:** Validación automática con JWT Strategy

### Ejemplo de Uso

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"agent1234"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "email": "agent@example.com", "role": "agent" }
# }

# 2. Usar token en requests
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 Métricas del Proyecto

- **Total de Endpoints:** 31
- **Tests Totales:** 229 (148 unitarios + 81 E2E)
- **Cobertura de Código:** 94.34%
- **Módulos:** 5 (auth, users, properties, tasks, database)
- **Guards Personalizados:** 2 (JWT Auth, Roles)
- **Decoradores Personalizados:** 2 (@Roles, @Public)

---

## 📝 Notas de Desarrollo

### Soft Deletes
Todas las entidades implementan soft delete:
- Campo `deletedAt` en cada modelo
- Los registros no se eliminan físicamente
- Queries filtran automáticamente registros eliminados

### Relaciones
- User → Property (1:N)
- Property → Task (1:N)
- User → Task (1:N via assignedTo)

### Validaciones
- DTOs con class-validator
- Validación automática en todos los endpoints
- Mensajes de error descriptivos

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico para la Universidad.

---

## 📞 Contacto

**Equipo de Desarrollo:**
- Juan Esteban Ruiz
- Juan David Quintero
- Juan Andrés Cano

Para consultas sobre el proyecto, revisar la documentación o abrir un issue en GitHub.

---

## 🙏 Agradecimientos

- NestJS Team por el excelente framework
- TypeORM Team por el ORM
- Comunidad de NestJS

---

**Desarrollado con ❤️ usando NestJS**
