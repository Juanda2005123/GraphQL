# 🏢 Real Estate API - GraphQL

> API GraphQL para gestión inmobiliaria con autenticación JWT, roles (superadmin/agent) y operaciones CRUD sobre usuarios, propiedades y tareas.

---

## 👥 Autores

<div align="center">

| Nombre |
|--------|
| **Juan Esteban Ruiz** |
| **Juan David Quintero** |
| **Juan Andrés Cano** | 

**Universidad:** Universidad Icesi  
**Curso:** Computación en Internet 3  
**Fecha:** 18 Noviembre 2025

</div>

---

## 🌐 Despliegue en Producción

<div align="center">

### ✨ **Aplicación Desplegada en Render** ✨

| Servicio | URL |
|----------|-----|
| 🎯 **GraphQL Playground** | [https://graphql-ft15.onrender.com/graphql](https://graphql-ft15.onrender.com/graphql) |
| 🔗 **Base URL** | `https://graphql-ft15.onrender.com` |

**Estado:** 🟢 En línea | **Última actualización:** Nov 18, 2024

### 🧪 Prueba la API en vivo

```graphql
# Accede al GraphQL Playground y ejecuta:
mutation Register {
  register(input: {
    name: "Demo User"
    email: "demo@test.com"
    password: "demo123"
  }) {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

</div>

## 📋 Tabla de Contenidos

- [🌐 Despliegue en Producción](#-despliegue-en-producción)
- [📖 Descripción](#-descripción)
- [✨ Características](#-características)
- [🛠 Tecnologías](#-tecnologías)
- [📦 Requisitos Previos](#-requisitos-previos)
- [🚀 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🎯 Ejecución](#-ejecución)
- [🧪 Testing](#-testing)
- [📚 GraphQL API](#-graphql-api)
- [📖 Documentación Completa](#-documentación-completa)
- [🔐 Autenticación](#-autenticación)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎓 Migración de REST a GraphQL](#-migración-de-rest-a-graphql)

---

## 📖 Descripción

Sistema completo de gestión inmobiliaria desarrollado con **NestJS y GraphQL** que permite a agentes y superadministradores gestionar propiedades y tareas asociadas.

### 🎯 Diferencia clave: REST vs GraphQL

Este proyecto es una **migración completa de API REST a GraphQL**, manteniendo todas las funcionalidades originales pero aprovechando las ventajas de GraphQL:

| Característica | REST (Original) | GraphQL (Actual) |
|----------------|-----------------|------------------|
| **Endpoints** | 31 endpoints diferentes | 1 endpoint único (`/graphql`) |
| **Obtención de datos** | Over-fetching/Under-fetching | Solo los campos solicitados |
| **Documentación** | Swagger separado | Schema auto-documentado + Playground interactivo |
| **Versionado** | `/api/v1`, `/api/v2` | Evolución del schema sin versiones |
| **Queries complejas** | Múltiples requests | 1 query con relaciones anidadas |

### 🌟 Funcionalidades Principales

El sistema incluye:

- ✅ **GraphQL API completa** con Queries, Mutations y Subscriptions
- ✅ **GraphQL Playground interactivo** para testing en vivo
- ✅ **Autenticación JWT** con roles diferenciados
- ✅ **Autorización basada en roles** (superadmin, agent)
- ✅ **Fragments reutilizables** para optimizar queries
- ✅ **Field Resolvers** para relaciones entre entidades
- ✅ **Manejo de errores** con códigos GraphQL estándar
- ✅ **Soft deletes** en todas las entidades
- ✅ **Testing completo** (94.34% de cobertura)
- ✅ **Desplegado en producción** (Render)

---

## ✨ Características

### 🚀 Características GraphQL

- ✅ **Schema-First Approach**
  - Schema auto-generado desde decoradores
  - Tipos fuertemente tipados con TypeScript
  - Validación automática de queries

- ✅ **Queries y Mutations**
  - CRUD completo de usuarios, propiedades y tareas
  - Queries públicas y protegidas
  - Mutations con validación de ownership

- ✅ **Fragments**
  - `UserFields` - Campos reutilizables de usuarios
  - `PropertyFields` - Campos reutilizables de propiedades
  - `TaskFields` - Campos reutilizables de tareas

- ✅ **Field Resolvers**
  - `owner` en Property (relación User)
  - `tasks` en Property (relación Task[])
  - `property` en Task (relación Property)
  - `assignedTo` en Task (relación User)

- ✅ **Manejo de Errores GraphQL**
  - `UNAUTHENTICATED` - Sin autenticación
  - `FORBIDDEN` - Sin permisos
  - `NOT_FOUND` - Recurso no existe
  - `BAD_USER_INPUT` - Validación fallida

### 📊 Gestión de Recursos

- ✅ **Autenticación y Autorización**
  - Registro de nuevos agentes
  - Login con JWT
  - Roles diferenciados (superadmin, agent)
  - Guards adaptados para GraphQL (GqlExecutionContext)

- ✅ **Gestión de Usuarios**
  - Query `me` - Perfil del usuario autenticado
  - Query `users` - Listado de usuarios (cualquier usuario autenticado puede ver)
  - Mutation `updateProfile` - Actualizar perfil propio
  - Mutations CRUD completas (solo superadmin)
  - Soft delete de cuentas

- ✅ **Gestión de Propiedades (Módulo Principal)**
  - Queries públicas `properties` y `property(id)`
  - Mutations para agentes (auto-asignación como owner)
  - Mutations para superadmin (asignación de owner)
  - Field resolver `owner` - Datos del propietario
  - Field resolver `tasks` - Tareas de la propiedad
  - Agentes solo modifican sus propias propiedades
  - Superadmin gestiona todas las propiedades

- ✅ **Gestión de Tareas (Módulo Relacionado)**
  - Query `myTasks` - Tareas del agente autenticado
  - Query `allTasks` - Todas las tareas (solo superadmin)
  - Query `tasksByProperty` - Tareas filtradas por propiedad
  - Mutations con validación de ownership
  - Field resolver `property` - Propiedad asociada
  - Field resolver `assignedTo` - Usuario asignado
  - Asignación automática de tareas

### 🔧 Características Técnicas

- ✅ **Base de Datos PostgreSQL** con TypeORM
- ✅ **Seed automático** con datos iniciales
- ✅ **Validación de datos** con class-validator en InputTypes
- ✅ **Testing** unitario y E2E (94.34% coverage)
- ✅ **CI/CD** con GitHub Actions
- ✅ **GraphQL Playground** interactivo con ejemplos
- ✅ **Swagger** legacy para compatibilidad
- ✅ **Soft deletes** en todas las entidades
- ✅ **Desplegado en Render** con PostgreSQL en la nube

---

## 🛠 Tecnologías

### Backend & GraphQL
- **NestJS** v11.0.1 - Framework Node.js
- **@nestjs/graphql** v13.2.0 - Módulo GraphQL para NestJS
- **Apollo Server** v5.1.0 - Servidor GraphQL
- **GraphQL** v16.12.0 - Especificación GraphQL
- **TypeScript** v5.7.3

### Base de Datos
- **PostgreSQL** v14+
- **TypeORM** v0.3.27 - ORM
- **Docker** - Para PostgreSQL en desarrollo

### Autenticación
- **Passport JWT** v4.0.1
- **bcrypt** v6.0.0 - Hash de passwords

### Testing
- **Jest** v30.0.0 - Testing unitario
- **Supertest** v7.0.0 - Testing E2E/integración

### Documentación
- **GraphQL Playground** - Interfaz interactiva
- **Swagger/OpenAPI** v11.2.1 - Documentación legacy

### DevOps
- **GitHub Actions** - CI/CD
- **Docker Compose** - Orquestación de contenedores
- **Render** - Plataforma de deployment

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

La aplicación estará disponible en:
- **GraphQL Playground:** `http://localhost:3001/graphql`
- **Swagger (legacy):** `http://localhost:3001/api/docs`

### Producción

```bash
# Build
npm run build

# Ejecutar
npm run start:prod
```

### 🌐 Acceder a la Aplicación

#### **Local:**
- **GraphQL Playground:** http://localhost:3001/graphql
- **Swagger Docs:** http://localhost:3001/api/docs

#### **Producción (Render):**
- **GraphQL Playground:** https://graphql-ft15.onrender.com/graphql
- **Swagger Docs:** https://graphql-ft15.onrender.com/api/docs

### 🌱 Seed de Datos Iniciales

El seed se ejecuta automáticamente al iniciar la aplicación. Crea:

- **Superadmin:** `admin@example.com` / `admin1234`
- **Agente 1:** `agent@example.com` / `agent1234`
- **Agente 2:** `agent.lisa@example.com` / `agentlisa1234`
- Propiedades y tareas de ejemplo con relaciones completas

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

## 📚 GraphQL API

### 🎮 GraphQL Playground

Accede al playground interactivo para probar queries y mutations en vivo:

**Local:** http://localhost:3001/graphql  
**Producción:** https://graphql-ft15.onrender.com/graphql

### 🔑 Autenticación

#### Registro de Usuario

```graphql
mutation Register {
  register(input: {
    name: "Juan Pérez"
    email: "juan@example.com"
    password: "password123"
  }) {
    token
    user {
      ...UserFields
    }
  }
}

fragment UserFields on User {
  id
  name
  email
  role
  createdAt
  updatedAt
}
```

#### Login

```graphql
mutation Login {
  login(input: {
    email: "agent@example.com"
    password: "agent1234"
  }) {
    token
    user {
      ...UserFields
    }
  }
}

fragment UserFields on User {
  id
  name
  email
  role
}
```

**Configurar Header de Autenticación:**

En GraphQL Playground, agrega en "HTTP HEADERS":
```json
{
  "Authorization": "Bearer TU_TOKEN_AQUI"
}
```

### 👥 Queries de Usuarios

#### Ver mi perfil

```graphql
query Me {
  me {
    ...UserFields
    createdAt
    updatedAt
  }
}

fragment UserFields on User {
  id
  name
  email
  role
}
```

#### Ver lista de usuarios (cualquier usuario autenticado)

```graphql
query Users {
  users {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  name
  email
  role
}
```

### 🏠 Queries de Propiedades (Público)

#### Listar todas las propiedades

```graphql
query Properties {
  properties {
    ...PropertyFields
    owner {
      ...UserFields
    }
    tasks {
      ...TaskFields
    }
  }
}

fragment PropertyFields on Property {
  id
  title
  description
  price
  location
  bedrooms
  bathrooms
  area
  imageUrls
  createdAt
  updatedAt
}

fragment UserFields on User {
  id
  name
  email
}

fragment TaskFields on Task {
  id
  title
  description
  isCompleted
}
```

#### Obtener propiedad específica

```graphql
query Property {
  property(id: "550e8400-e29b-41d4-a716-446655440000") {
    ...PropertyFields
    owner {
      ...UserFields
    }
    tasks {
      ...TaskFields
      assignedTo {
        ...UserFields
      }
    }
  }
}

fragment PropertyFields on Property {
  id
  title
  description
  price
  location
  bedrooms
  bathrooms
  area
}

fragment UserFields on User {
  id
  name
  email
}

fragment TaskFields on Task {
  id
  title
  description
  isCompleted
}
```

### 🏢 Mutations de Propiedades

#### Crear propiedad (Agente - auto-asignación)

```graphql
mutation CreatePropertyByAgent {
  createPropertyByAgent(input: {
    title: "Casa moderna en Cali"
    description: "Hermosa casa de 3 pisos con jardín"
    price: 250000
    location: "Cali, Colombia"
    bedrooms: 3
    bathrooms: 2
    area: 120
    imageUrls: ["https://example.com/image1.jpg"]
  }) {
    ...PropertyFields
    owner {
      ...UserFields
    }
  }
}

fragment PropertyFields on Property {
  id
  title
  price
  location
}

fragment UserFields on User {
  id
  name
}
```

#### Actualizar propiedad propia (Agente)

```graphql
mutation UpdatePropertyByAgent {
  updatePropertyByAgent(
    id: "550e8400-e29b-41d4-a716-446655440000"
    input: {
      title: "Casa moderna actualizada"
      price: 280000
    }
  ) {
    ...PropertyFields
  }
}

fragment PropertyFields on Property {
  id
  title
  price
  updatedAt
}
```

#### Eliminar propiedad propia (Agente)

```graphql
mutation DeletePropertyByAgent {
  deletePropertyByAgent(id: "550e8400-e29b-41d4-a716-446655440000")
}
```

#### Crear propiedad con owner asignado (Superadmin)

```graphql
mutation CreatePropertyByAdmin {
  createPropertyByAdmin(input: {
    title: "Apartamento ejecutivo"
    description: "Moderno apartamento en zona exclusiva"
    price: 180000
    location: "Bogotá, Colombia"
    bedrooms: 2
    bathrooms: 2
    area: 80
    ownerId: "550e8400-e29b-41d4-a716-446655440001"
  }) {
    ...PropertyFields
    owner {
      ...UserFields
    }
  }
}

fragment PropertyFields on Property {
  id
  title
  price
}

fragment UserFields on User {
  id
  name
  email
}
```

### ✅ Queries de Tareas

#### Ver mis tareas (Agente)

```graphql
query MyTasks {
  myTasks {
    ...TaskFields
    property {
      ...PropertyFields
    }
    assignedTo {
      ...UserFields
    }
  }
}

fragment TaskFields on Task {
  id
  title
  description
  isCompleted
  createdAt
}

fragment PropertyFields on Property {
  id
  title
  location
}

fragment UserFields on User {
  id
  name
}
```

#### Ver todas las tareas (Superadmin)

```graphql
query AllTasks {
  allTasks {
    ...TaskFields
    property {
      ...PropertyFields
      owner {
        ...UserFields
      }
    }
    assignedTo {
      ...UserFields
    }
  }
}

fragment TaskFields on Task {
  id
  title
  isCompleted
}

fragment PropertyFields on Property {
  id
  title
}

fragment UserFields on User {
  id
  name
}
```

### 📝 Mutations de Tareas

#### Crear tarea en mi propiedad (Agente)

```graphql
mutation CreateTaskByAgent {
  createTaskByAgent(input: {
    title: "Reparar techo"
    description: "El techo tiene goteras que necesitan reparación urgente"
    propertyId: "550e8400-e29b-41d4-a716-446655440000"
  }) {
    ...TaskFields
    property {
      ...PropertyFields
    }
    assignedTo {
      ...UserFields
    }
  }
}

fragment TaskFields on Task {
  id
  title
  description
  isCompleted
}

fragment PropertyFields on Property {
  id
  title
}

fragment UserFields on User {
  id
  name
}
```

#### Actualizar tarea propia (Agente)

```graphql
mutation UpdateTaskByAgent {
  updateTaskByAgent(
    id: "550e8400-e29b-41d4-a716-446655440002"
    input: {
      title: "Tarea actualizada"
      isCompleted: true
    }
  ) {
    ...TaskFields
  }
}

fragment TaskFields on Task {
  id
  title
  isCompleted
  updatedAt
}
```

### 📊 Field Resolvers (Relaciones)

GraphQL permite obtener datos relacionados en una sola query:

```graphql
# Ejemplo: Obtener propiedad con todas sus relaciones
query PropertyWithRelations {
  property(id: "550e8400-e29b-41d4-a716-446655440000") {
    id
    title
    price
    
    # Field Resolver: owner (User)
    owner {
      id
      name
      email
      role
    }
    
    # Field Resolver: tasks (Task[])
    tasks {
      id
      title
      isCompleted
      
      # Field Resolver anidado: assignedTo (User)
      assignedTo {
        id
        name
      }
    }
  }
}
```

---

## 📖 Documentación Completa

### GraphQL Schema

El schema completo está auto-generado en `src/schema.gql` con todos los tipos, queries y mutations disponibles.

### Colección de Postman

Para testing de la API GraphQL, importa la colección desde:  
`postman/Inmobiliaria GraphQL.postman_collection.json`

**Características de la colección:**
- ✅ Todas las queries y mutations documentadas
- ✅ Ejemplos con fragments
- ✅ Autenticación automática (guarda token)
- ✅ Variables de entorno configuradas
- ✅ URL de producción por defecto

### Swagger UI (Legacy - API REST)

Aunque el proyecto usa GraphQL, mantiene compatibilidad con Swagger para referencia:

**Local:** http://localhost:3001/api/docs  
**Producción:** https://graphql-ft15.onrender.com/api/docs

---

## 🔐 Autenticación

### Flujo de Autenticación GraphQL

1. **Registro:** Mutation `register` → Usuario se registra como `agent`
2. **Login:** Mutation `login` → Recibe JWT token
3. **Uso del token:** Incluir en header HTTP `Authorization: Bearer <token>`
4. **Queries/Mutations protegidas:** Validación automática con JWT Strategy adaptado para GraphQL

### Ejemplo de Uso Completo

```graphql
# 1. Registrarse
mutation {
  register(input: {
    name: "Demo User"
    email: "demo@example.com"
    password: "demo123"
  }) {
    token
    user { id name email role }
  }
}

# Response incluye: { "token": "eyJhbGc..." }

# 2. Configurar header en GraphQL Playground
# HTTP HEADERS:
{
  "Authorization": "Bearer eyJhbGc..."
}

# 3. Usar queries protegidas
query {
  me {
    id
    name
    email
    role
  }
}

# 4. Crear propiedad
mutation {
  createPropertyByAgent(input: {
    title: "Mi primera propiedad"
    description: "Casa hermosa"
    price: 200000
    location: "Cali"
    bedrooms: 3
    bathrooms: 2
    area: 100
  }) {
    id
    title
    owner { name }
  }
}
---

## 🚀 Deployment y CI/CD

### 🌐 Producción en Render

La aplicación está desplegada en **Render**:

- **🎯 GraphQL Playground:** https://graphql-ft15.onrender.com/graphql
- **🔗 Base URL:** https://graphql-ft15.onrender.com

**Características del deployment:**
- ✅ PostgreSQL en la nube (compartida con API REST anterior)
- ✅ Auto-deploy desde GitHub (rama `main`)
- ✅ HTTPS automático con SSL
- ✅ Variables de entorno seguras
- ✅ Logs en tiempo real

### 👥 Usuarios de Prueba en Producción

Puedes probar la API GraphQL en producción con estos usuarios:

| Rol | Email | Password |
|-----|-------|----------|
| **Superadmin** | `admin@example.com` | `admin1234` |
| **Agente 1** | `agent@example.com` | `agent1234` |
| **Agente 2** | `agent.lisa@example.com` | `agentlisa1234` |

### 🔄 CI/CD Pipeline

El proyecto implementa un pipeline completo de despliegue automatizado:

#### GitHub Actions (`.github/workflows/test.yml`)
- ✅ Ejecuta linter
- ✅ Ejecuta tests unitarios
- ✅ Ejecuta tests E2E
- ✅ Genera reporte de coverage

**Triggers:**
- Push a `main` o `develop`
- Pull requests a `main`

#### Auto-Deploy (Render)
- ✅ Render detecta cambios en `main` automáticamente
- ✅ Ejecuta build (`npm run build`)
- ✅ Inicia aplicación (`npm run start:prod`)
- ✅ Health check en puerto 10000

**Flujo completo:**
```
1. Push a main → 2. GitHub Actions (tests) → 3. Tests pasan ✅ → 4. Render auto-deploy → 5. Aplicación en producción 🚀
```

### Configuración de Producción

**Configuración de Producción en Render:**
- `NODE_ENV=production`
- `DATABASE_URL` (provista por PostgreSQL de Render)
- `JWT_SECRET` (secreto único de producción)
- `PORT` (dinámico, asignado por Render)

**Flujo de Deploy:**
```
1. Push a main → 2. GitHub Actions (tests) → 3. Tests pasan ✅ → 4. Render auto-deploy → 5. Aplicación en producción 🚀
```

---

## 🙏 Agradecimientos

Gracias al profesor **Leonardo Bustamante** por la guía en el desarrollo de este proyecto y por introducirnos a las tecnologías modernas de backend.

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para el curso de Computación 3 de la Universidad Icesi.

---

<div align="center">

**Desarrollado con ❤️ por Juan Esteban Ruiz, Juan David Quintero y Juan Andrés Cano**

🏢 **Real Estate API - GraphQL** | Universidad Icesi | 2024

[⬆️ Volver arriba](#-real-estate-api---graphql)

</div>

---

## 📁 Estructura del Proyecto

```
GraphQL/
├── src/
│   ├── auth/                    # Módulo de autenticación GraphQL
│   │   ├── dto/
│   │   │   └── auth.types.ts   # Types GraphQL (AuthResponse, LoginInput, etc.)
│   │   ├── auth.resolver.ts    # Resolvers de Auth (register, login)
│   │   ├── auth.service.ts     # Lógica de autenticación
│   │   ├── jwt.strategy.ts     # Estrategia JWT
│   │   ├── jwt-auth.guard.ts   # Guard adaptado para GraphQL
│   │   ├── roles.guard.ts      # Guard de roles para GraphQL
│   │   └── current-user.decorator.ts  # Decorador @CurrentUser()
│   │
│   ├── users/                   # Módulo de usuarios GraphQL
│   │   ├── dto/
│   │   │   └── user.types.ts   # Types GraphQL (User, UpdateProfileInput, etc.)
│   │   ├── user.resolver.ts    # Resolvers de User (me, users, mutations)
│   │   ├── user.service.ts     # Lógica de negocio
│   │   └── user.model.ts       # Entidad TypeORM
│   │
│   ├── properties/              # Módulo de propiedades GraphQL
│   │   ├── dto/
│   │   │   └── property.types.ts  # Types GraphQL
│   │   ├── dtos/
│   │   │   ├── create-property.dto.ts
│   │   │   ├── update-property.dto.ts
│   │   │   └── response-property.dto.ts
│   │   ├── property.resolver.ts   # Resolvers + Field Resolvers
│   │   ├── property.service.ts    # Lógica de negocio
│   │   └── property.model.ts      # Entidad TypeORM
│   │
│   ├── tasks/                   # Módulo de tareas GraphQL
│   │   ├── dto/
│   │   │   └── task.types.ts   # Types GraphQL
│   │   ├── dtos/
│   │   │   ├── create-task.dto.ts
│   │   │   ├── update-task.dto.ts
│   │   │   └── response-task.dto.ts
│   │   ├── task.resolver.ts    # Resolvers + Field Resolvers
│   │   ├── task.service.ts     # Lógica de negocio
│   │   └── task.model.ts       # Entidad TypeORM
│   │
│   ├── database/                # Configuración de DB
│   │   └── database.module.ts  # TypeORM config (DATABASE_URL + SSL)
│   │
│   ├── seed/                    # Seed de datos
│   │   ├── seed.service.ts     # Población de datos iniciales
│   │   └── seed.module.ts
│   │
│   ├── schema.gql               # Schema GraphQL auto-generado
│   ├── app.module.ts            # Módulo principal
│   └── main.ts                  # Bootstrap (GraphQL + CORS + SSL)
│
├── test/                        # Tests E2E
│   ├── auth.e2e-spec.ts
│   ├── users.e2e-spec.ts
│   ├── properties.e2e-spec.ts
│   ├── tasks.e2e-spec.ts
│   └── test-utils.ts
│
├── postman/                     # Colección GraphQL
│   └── Inmobiliaria GraphQL.postman_collection.json
│
├── .github/
│   └── workflows/               # GitHub Actions
│       └── test.yml
│
├── coverage/                    # Reportes de coverage
├── docker-compose.yml           # PostgreSQL container
├── .env.example                 # Variables de entorno de ejemplo
├── DEPLOY_RENDER.md             # Guía de deployment
├── INFORME.md                   # Informe técnico completo
├── package.json
└── README.md
```

---

## 🎓 Migración de REST a GraphQL

### 🔄 Comparación de Arquitectura

#### **Antes (REST):**
```
Controllers → Services → Repository (TypeORM) → PostgreSQL
    ↓
31 endpoints diferentes (/api/users, /api/properties, etc.)
```

#### **Ahora (GraphQL):**
```
Resolvers → Services → Repository (TypeORM) → PostgreSQL
    ↓
1 endpoint único (/graphql) con Queries y Mutations
```

### 🎯 Cambios Principales Realizados

| Aspecto | REST (Antes) | GraphQL (Ahora) |
|---------|--------------|-----------------|
| **Routing** | `@Controller()` + `@Get()`, `@Post()`, etc. | `@Resolver()` + `@Query()`, `@Mutation()` |
| **Request/Response** | DTOs con `@ApiProperty()` | InputTypes y ObjectTypes con `@Field()` |
| **Autenticación** | `@UseGuards(JwtAuthGuard)` | `@UseGuards(GqlAuthGuard)` adaptado |
| **User Injection** | `@Req() req: Request` | `@CurrentUser() user: User` con decorador custom |
| **Documentación** | Swagger manual | Schema auto-generado + Playground |
| **Validación** | class-validator en DTOs | class-validator en InputTypes |
| **Relaciones** | Joins manuales o múltiples requests | Field Resolvers automáticos |

### 📝 Ejemplo de Migración: Crear Propiedad

#### **REST (Antes):**
```typescript
@Post('agent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AGENT)
async createForAgent(
  @Body() dto: CreatePropertyDto,
  @Req() req: Request
) {
  return this.propertyService.createForAgent(dto, req.user.id);
}
```

#### **GraphQL (Ahora):**
```typescript
@Mutation(() => Property)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.AGENT)
async createPropertyByAgent(
  @Args('input') input: CreatePropertyInput,
  @CurrentUser() user: User
): Promise<Property> {
  return this.propertyService.createForAgent(input, user.id);
}
```

### 🌟 Ventajas de GraphQL Implementadas

1. **✅ Queries Flexibles**
   ```graphql
   # Cliente decide qué campos necesita
   query {
     properties {
       id
       title
       price  # Solo estos 3 campos
     }
   }
   ```

2. **✅ Relaciones en 1 Request**
   ```graphql
   # Antes: 3 requests REST
   # Ahora: 1 query GraphQL
   query {
     property(id: "123") {
       title
       owner { name email }
       tasks { title isCompleted }
     }
   }
   ```

3. **✅ Fragments Reutilizables**
   ```graphql
   fragment UserFields on User {
     id name email role
   }
   
   # Reutilizar en múltiples queries
   query { me { ...UserFields } }
   query { users { ...UserFields } }
   ```

4. **✅ Manejo de Errores Estándar**
   ```json
   {
     "errors": [{
       "message": "Forbidden resource",
       "extensions": { "code": "FORBIDDEN" }
     }]
   }
   ```

### 🔧 Dificultades Encontradas y Soluciones

#### 1. **Adaptación de Guards a GraphQL**

**Problema:** Los guards de NestJS REST usan `ExecutionContext` directamente, pero GraphQL necesita `GqlExecutionContext`.

**Solución:**
```typescript
// jwt-auth.guard.ts
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

#### 2. **Field Resolvers y Queries N+1**

**Problema:** Cargar relaciones (`owner`, `tasks`) podía generar múltiples queries a la DB.

**Solución:** Implementar Field Resolvers con carga lazy:
```typescript
@ResolveField(() => User)
async owner(@Parent() property: Property): Promise<User> {
  return this.userService.findById(property.ownerId);
}
```

#### 3. **Permisos de Query `users`**

**Problema:** En REST, solo superadmin podía listar usuarios. En GraphQL, el enunciado requiere que **cualquier usuario autenticado** pueda ver la lista.

**Solución:** Cambiar el guard de `@Roles(UserRole.SUPERADMIN)` a solo `@UseGuards(GqlAuthGuard)`:
```typescript
@Query(() => [User])
@UseGuards(GqlAuthGuard)  // Cualquier usuario autenticado
async users(): Promise<User[]> {
  return this.userService.findAll();
}
```

#### 4. **Decorador @CurrentUser() para GraphQL**

**Problema:** `@Req()` no funciona en GraphQL resolvers.

**Solución:** Crear decorador personalizado:
```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

### 📊 Métricas de Migración

| Métrica | REST | GraphQL | Mejora |
|---------|------|---------|--------|
| **Endpoints** | 31 | 1 (`/graphql`) | -97% |
| **Requests para datos complejos** | 3-5 | 1 | -80% |
| **Over-fetching** | Alto | Ninguno | ✅ |
| **Under-fetching** | Frecuente | Ninguno | ✅ |
| **Documentación** | Manual | Auto-generada | ✅ |
| **Testing interactivo** | Postman | GraphQL Playground | ✅ |

---

## 👥 Roles y Permisos

### Superadmin
- ✅ Acceso total a todos los recursos
- ✅ Crear, editar, eliminar usuarios
- ✅ Gestionar todas las propiedades
- ✅ Gestionar todas las tareas
- ✅ Asignar owners a propiedades
- ✅ Asignar tareas a cualquier usuario

### Agent
- ✅ Ver su propio perfil (`me` query)
- ✅ **Ver lista de otros usuarios** (`users` query - cambio según enunciado)
- ✅ Actualizar su perfil
- ✅ Eliminar su cuenta
- ✅ Crear propiedades (auto-asignación como owner)
- ✅ Ver todas las propiedades (queries públicas)
- ✅ Solo editar/eliminar sus propias propiedades
- ✅ Crear tareas en sus propiedades
- ✅ Solo ver/editar tareas de sus propiedades
- ❌ No puede gestionar usuarios
- ❌ No puede modificar propiedades de otros
- ❌ No puede acceder a tareas de otros agentes

---

## 📊 Métricas del Proyecto

- **Tipo de API:** GraphQL (migrado desde REST)
- **Queries:** 8 (me, users, properties, property, myTasks, myTask, allTasks, task, etc.)
- **Mutations:** 15+ (register, login, CRUD de properties y tasks)
- **Field Resolvers:** 4 (owner, tasks, property, assignedTo)
- **Fragments Documentados:** 3 (UserFields, PropertyFields, TaskFields)
- **Tests Totales:** 229 (148 unitarios + 81 E2E)
- **Cobertura de Código:** 94.34%
- **Módulos:** 5 (auth, users, properties, tasks, database)
- **Guards GraphQL:** 2 (GqlAuthGuard, RolesGuard adaptados)
- **Decoradores Personalizados:** 3 (@Roles, @Public, @CurrentUser)

---

## 📝 Notas de Desarrollo

### Soft Deletes
Todas las entidades implementan soft delete:
- Campo `deletedAt` en cada modelo
- Los registros no se eliminan físicamente
- TypeORM filtra automáticamente registros eliminados
- Preserva integridad referencial

### Relaciones
- User → Property (1:N) - Un usuario tiene muchas propiedades
- Property → Task (1:N) - Una propiedad tiene muchas tareas
- User → Task (1:N) - Un usuario tiene muchas tareas asignadas
- Carga lazy con Field Resolvers para optimización

### Validaciones GraphQL
- InputTypes con class-validator
- Validación automática en todos los inputs
- Mensajes de error descriptivos en formato GraphQL
- Códigos de error estándar (UNAUTHENTICATED, FORBIDDEN, etc.)

### Base de Datos en Producción
- PostgreSQL en Render (compartida con API REST anterior)
- Conexión segura con SSL (`rejectUnauthorized: false`)
- Variable `DATABASE_URL` provista por Render
- Sincronización automática deshabilitada en producción
