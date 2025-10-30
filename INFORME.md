# 📋 Informe Técnico - Real Estate API

**Proyecto:** API REST para Gestión Inmobiliaria  
**Framework:** NestJS v11.0.1  
**Fecha:** Octubre 2024  
**Curso:** Computación 3

## 👥 Equipo de Desarrollo

- **Juan Esteban Ruiz**
- **Juan David Quintero**
- **Juan Andrés Cano**

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Autenticación JWT](#3-autenticación-jwt)
4. [Autorización Basada en Roles](#4-autorización-basada-en-roles)
5. [Persistencia en Base de Datos](#5-persistencia-en-base-de-datos)
6. [Documentación de Endpoints](#6-documentación-de-endpoints)
7. [Testing y Cobertura](#7-testing-y-cobertura)
8. [Conclusiones](#8-conclusiones)

---

## 1. Resumen Ejecutivo

### 1.1 Descripción del Proyecto

Sistema completo de gestión inmobiliaria desarrollado con NestJS que permite a agentes inmobiliarios y superadministradores gestionar propiedades, usuarios y tareas asociadas. El sistema implementa autenticación JWT, autorización basada en roles, y persistencia con PostgreSQL.

### 1.2 Objetivos Cumplidos

| Requisito | Puntos | Estado | Porcentaje |
|-----------|--------|--------|------------|
| Seed de Base de Datos | 5% | ✅ Completado | 100% |
| Autenticación JWT | 5% | ✅ Completado | 100% |
| Autorización por Roles | 5% | ✅ Completado | 100% |
| Pruebas (>80% coverage) | 25% | ✅ Completado (94.34%) | 100% |
| Persistencia PostgreSQL | 10% | ✅ Completado | 100% |
| Funcionalidades CRUD | 25% | ✅ Completado | 100% |
| GitHub Actions | - | ✅ Completado | 100% |
| Swagger Documentation | - | ✅ Completado | 100% |
| **TOTAL** | **75%** | **✅** | **100%** |

**Nota:** Falta Despliegue (15%) e Informe (10%) que se completarán en la fase final.

### 1.3 Tecnologías Utilizadas

- **Backend:** NestJS 11.0.1, TypeScript 5.6.2
- **Base de Datos:** PostgreSQL 14+, TypeORM 0.3.20
- **Autenticación:** Passport JWT, bcrypt
- **Testing:** Jest, Supertest
- **Documentación:** Swagger/OpenAPI
- **CI/CD:** GitHub Actions
- **Containerización:** Docker, Docker Compose

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura General

El sistema sigue una arquitectura modular en capas basada en el patrón MVC adaptado a NestJS:

```
┌─────────────────────────────────────────┐
│          API REST Endpoints             │
│         (Controllers Layer)             │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│            (Services)                   │
├─────────────────────────────────────────┤
│      Data Access Layer (TypeORM)        │
├─────────────────────────────────────────┤
│         PostgreSQL Database             │
└─────────────────────────────────────────┘

         Protección Transversal:
    ┌────────────────────────────┐
    │  Guards (Auth & Roles)     │
    │  Validators (DTOs)         │
    │  Interceptors              │
    └────────────────────────────┘
```

### 2.2 Módulos del Sistema

#### Módulo de Autenticación (`auth`)
- **Responsabilidad:** Gestión de autenticación de usuarios
- **Componentes:**
  - `AuthController`: Endpoints de login, register, logout
  - `AuthService`: Lógica de autenticación y generación de tokens
  - `JwtStrategy`: Estrategia de validación de tokens JWT
  - `JwtAuthGuard`: Guard para proteger rutas
  - `RolesGuard`: Guard para validar roles

#### Módulo de Usuarios (`users`)
- **Responsabilidad:** Gestión de usuarios del sistema
- **Componentes:**
  - `UserController`: CRUD de usuarios y gestión de perfil
  - `UserService`: Lógica de negocio de usuarios
  - `User`: Entidad TypeORM

#### Módulo de Propiedades (`properties`)
- **Responsabilidad:** Gestión de propiedades inmobiliarias
- **Componentes:**
  - `PropertyController`: Endpoints públicos y protegidos
  - `PropertyService`: Lógica de negocio de propiedades
  - `Property`: Entidad TypeORM

#### Módulo de Tareas (`tasks`)
- **Responsabilidad:** Gestión de tareas asociadas a propiedades
- **Componentes:**
  - `TaskController`: Endpoints de tareas por rol
  - `TaskService`: Lógica de negocio de tareas
  - `Task`: Entidad TypeORM

#### Módulo de Base de Datos (`database`)
- **Responsabilidad:** Configuración de TypeORM
- **Componentes:**
  - `DatabaseModule`: Configuración de conexión
  - `SeedService`: Población inicial de datos

### 2.3 Flujo de Petición

```
1. Cliente → HTTP Request
2. NestJS Router → Identifica Controller
3. Guards → Valida autenticación y permisos
4. Pipes → Valida y transforma DTOs
5. Controller → Delega a Service
6. Service → Ejecuta lógica de negocio
7. TypeORM → Interactúa con PostgreSQL
8. Response → DTO serializado al cliente
```

---

## 3. Autenticación JWT

### 3.1 Implementación de JWT

#### 3.1.1 Estrategia JWT

**Archivo:** `src/auth/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { userId: user.id, email: user.email, role: user.role };
  }
}
```

**Funcionalidad:**
- Extrae el token del header `Authorization: Bearer <token>`
- Valida la firma del token con `JWT_SECRET`
- Verifica que el usuario existe en la base de datos
- Rechaza tokens expirados
- Adjunta datos del usuario al request

#### 3.1.2 Generación de Tokens

**Archivo:** `src/auth/auth.service.ts`

```typescript
async login(user: User): Promise<AuthResponseDto> {
  const payload = { email: user.email, sub: user.id, role: user.role };
  return {
    token: this.jwtService.sign(payload),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
}
```

**Estructura del Token:**
```json
{
  "email": "agent@example.com",
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "agent",
  "iat": 1698765432,
  "exp": 1698851832
}
```

#### 3.1.3 Protección de Rutas

**Guard Global:**
```typescript
// app.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

**Decorador @Public() para rutas abiertas:**
```typescript
@Public()
@Get()
getPublicProperties() { ... }
```

### 3.2 Flujo de Autenticación

#### Registro de Usuario

```
POST /api/auth/register
Body: { name, email, password }
      ↓
1. Validación de datos (DTOs)
2. Verificación de email único
3. Hash de password con bcrypt (10 rounds)
4. Creación de usuario con rol 'agent'
5. Response: Datos del usuario (sin password)
```

#### Login

```
POST /api/auth/login
Body: { email, password }
      ↓
1. Buscar usuario por email
2. Comparar password con bcrypt.compare()
3. Generar JWT token (expiración: 1 día)
4. Response: { token, user }
```

#### Uso del Token

```
GET /api/users/me
Headers: { Authorization: "Bearer eyJhbGc..." }
      ↓
1. JwtAuthGuard extrae el token
2. JwtStrategy valida firma y expiración
3. Verifica que el usuario existe
4. Adjunta user al request.user
5. Controller accede a req.user
```

### 3.3 Seguridad del Password

- **Algoritmo:** bcrypt con 10 rounds de salt
- **Hash antes de guardar:** Automático en `@BeforeInsert()` y `@BeforeUpdate()`
- **Nunca se devuelve el hash:** Excluido en todas las responses
- **Validación:** Mínimo 8 caracteres

```typescript
@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  if (this.password && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
```

---

## 4. Autorización Basada en Roles

### 4.1 Sistema de Roles

#### 4.1.1 Definición de Roles

**Archivo:** `src/users/user.model.ts`

```typescript
export enum UserRole {
  SUPERADMIN = 'superadmin',
  AGENT = 'agent',
}
```

#### 4.1.2 Roles Guard

**Archivo:** `src/auth/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**Aplicación Global:**
```typescript
{
  provide: APP_GUARD,
  useClass: RolesGuard,
}
```

#### 4.1.3 Decorador @Roles()

```typescript
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

**Uso en Controllers:**
```typescript
@Get()
@Roles(UserRole.SUPERADMIN)
findAll() { ... }
```

### 4.2 Permisos por Rol

#### Superadmin
| Recurso | Crear | Leer | Actualizar | Eliminar |
|---------|-------|------|------------|----------|
| Usuarios | ✅ | ✅ | ✅ | ✅ |
| Propiedades | ✅ (asigna owner) | ✅ | ✅ | ✅ |
| Tareas | ✅ (asigna a cualquiera) | ✅ | ✅ | ✅ |

**Capacidades especiales:**
- Crear usuarios con cualquier rol
- Modificar cualquier recurso
- Asignar ownership de propiedades
- Asignar tareas a cualquier usuario

#### Agent
| Recurso | Crear | Leer | Actualizar | Eliminar |
|---------|-------|------|------------|----------|
| Su perfil | - | ✅ | ✅ | ✅ |
| Otros usuarios | ❌ | ❌ | ❌ | ❌ |
| Sus propiedades | ✅ | ✅ | ✅ | ✅ |
| Otras propiedades | ❌ | ✅ (público) | ❌ | ❌ |
| Sus tareas | ✅ | ✅ | ✅ | ✅ |
| Otras tareas | ❌ | ❌ | ❌ | ❌ |

**Restricciones:**
- Solo ve/modifica recursos que le pertenecen
- Auto-asignación como owner al crear propiedades
- No puede gestionar otros usuarios

### 4.3 Validación de Ownership

La autorización no solo valida roles, sino también la propiedad de los recursos:

**Ejemplo en PropertyService:**
```typescript
async updateForAgent(id: string, dto: UpdateDto, userId: string) {
  const property = await this.findOneOrThrow(id);
  
  // Validar ownership
  if (property.owner.id !== userId) {
    throw new ForbiddenException('No puedes modificar esta propiedad');
  }
  
  // Actualizar...
}
```

**Aplicado en:**
- Propiedades: Solo owner puede modificar/eliminar
- Tareas: Solo owner de la propiedad asociada puede gestionar tareas

### 4.4 Rutas Públicas

Algunas rutas no requieren autenticación:

```typescript
@Public()
@Get()
getPublicProperties() { ... }
```

**Endpoints públicos:**
- `GET /api/properties` - Listar propiedades
- `GET /api/properties/:id` - Ver detalle de propiedad
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

---

## 5. Persistencia en Base de Datos

### 5.1 Configuración de TypeORM

#### 5.1.1 Database Module

**Archivo:** `src/database/database.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/../**/*.model{.ts,.js}'],
        synchronize: true, // Solo en desarrollo
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
```

**Características:**
- Configuración mediante variables de entorno
- Carga automática de entidades
- Synchronize activado en desarrollo
- Logging desactivado para producción

### 5.2 Modelo de Datos

#### 5.2.1 Entidad User

**Archivo:** `src/users/user.model.ts`

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT,
  })
  role: UserRole;

  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
```

**Características:**
- UUID como primary key
- Email único con índice
- Rol con enum
- Hash automático de password
- Timestamps automáticos
- Soft delete

#### 5.2.2 Entidad Property

```typescript
@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  location: string;

  @Column('int')
  bedrooms: number;

  @Column('int')
  bathrooms: number;

  @Column('decimal', { precision: 10, scale: 2 })
  area: number;

  @Column('simple-array', { nullable: true })
  imageUrls: string[];

  @ManyToOne(() => User, (user) => user.properties, { nullable: true })
  owner: User;

  @OneToMany(() => Task, (task) => task.property, { cascade: true })
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

**Características:**
- Relación ManyToOne con User (owner)
- Relación OneToMany con Task (cascade delete)
- Precios y áreas con precisión decimal
- Array de URLs de imágenes
- Soft delete con cascada a tareas

#### 5.2.3 Entidad Task

```typescript
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  title: string;

  @Column('text')
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => Property, (property) => property.tasks, { nullable: true })
  property: Property;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  assignedTo: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

**Características:**
- Relación con Property (se elimina si la propiedad se elimina)
- Relación con User (asignado)
- Estado de completitud
- Soft delete

### 5.3 Relaciones entre Entidades

```
User (1) ─────── (N) Property
  │                    │
  │                    │
  │                    │
  └──────── (N) Task (N)
```

**Cardinalidades:**
- 1 User tiene N Properties (como owner)
- 1 Property tiene N Tasks
- 1 User tiene N Tasks (como assignedTo)
- 1 Task pertenece a 1 Property
- 1 Task está asignada a 1 User

### 5.4 Soft Deletes

Todas las entidades implementan soft delete:

```typescript
@DeleteDateColumn()
deletedAt: Date;
```

**Comportamiento:**
- `DELETE` no elimina el registro físicamente
- Establece `deletedAt` con la fecha actual
- TypeORM filtra automáticamente registros con `deletedAt`
- Preserva integridad referencial
- Permite recuperación de datos

**Cascada en Property → Task:**
```typescript
@OneToMany(() => Task, (task) => task.property, { cascade: true })
tasks: Task[];
```

Al eliminar una propiedad, todas sus tareas se eliminan automáticamente (soft delete).

### 5.5 Seed de Datos

**Archivo:** `src/seed/seed.service.ts`

El seed se ejecuta automáticamente al iniciar la aplicación:

**Datos creados:**

1. **Superadmin**
   - Email: `admin@example.com`
   - Password: `admin1234`
   - Rol: `superadmin`

2. **Agentes**
   - Agent 1: `agent@example.com` / `agent1234`
   - Agent 2: `agent.lisa@example.com` / `agentlisa1234`

3. **Propiedades** (2 por agente)
   - Casas modernas
   - Apartamentos
   - Con ubicaciones, precios, características

4. **Tareas** (2 por propiedad)
   - Mantenimiento
   - Inspecciones
   - Asignadas a los owners

**Características del Seed:**
- Idempotente (no duplica datos)
- Verifica existencia antes de crear
- Passwords hasheados automáticamente
- Relaciones correctamente establecidas

---

## 6. Documentación de Endpoints

### 6.1 Autenticación

#### 6.1.1 Registrar Usuario

**Endpoint:** `POST /api/auth/register`

**Descripción:** Registra un nuevo usuario con rol de agente.

**Autenticación:** No requerida

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Validaciones:**
- `name`: string, requerido
- `email`: email válido, requerido, único
- `password`: mínimo 8 caracteres, requerido

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "agent",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos o email ya registrado
- `401 Unauthorized`: Email ya existe

#### 6.1.2 Iniciar Sesión

**Endpoint:** `POST /api/auth/login`

**Descripción:** Autentica un usuario y devuelve un token JWT.

**Autenticación:** No requerida

**Request Body:**
```json
{
  "email": "agent@example.com",
  "password": "agent1234"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Agent One",
    "email": "agent@example.com",
    "role": "agent",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: Credenciales incorrectas

#### 6.1.3 Cerrar Sesión

**Endpoint:** `POST /api/auth/logout`

**Descripción:** Cierra la sesión del usuario (invalidación del lado del cliente).

**Autenticación:** Bearer Token requerido

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Session terminated. Please discard your JWT token."
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado

### 6.2 Usuarios

#### 6.2.1 Obtener Perfil Actual

**Endpoint:** `GET /api/users/me`

**Descripción:** Obtiene el perfil del usuario autenticado.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`, `superadmin`

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Agent One",
  "email": "agent@example.com",
  "role": "agent",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 6.2.2 Actualizar Perfil

**Endpoint:** `PUT /api/users/me`

**Descripción:** Actualiza el perfil del usuario autenticado.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`, `superadmin`

**Request Body:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@example.com",
  "password": "newpassword123"
}
```

**Nota:** Todos los campos son opcionales.

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nuevo Nombre",
  "email": "nuevo@example.com",
  "role": "agent",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### 6.2.3 Eliminar Cuenta

**Endpoint:** `DELETE /api/users/me`

**Descripción:** Elimina (soft delete) la cuenta del usuario autenticado.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`, `superadmin`

**Response:** `204 No Content`

#### 6.2.4 Crear Usuario (Admin)

**Endpoint:** `POST /api/users`

**Descripción:** Crea un nuevo usuario (solo superadmin).

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Request Body:**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "password123",
  "role": "agent"
}
```

**Response 201:**
```json
{
  "id": "...",
  "name": "María García",
  "email": "maria@example.com",
  "role": "agent",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `403 Forbidden`: No tiene permisos de superadmin

#### 6.2.5 Listar Usuarios (Admin)

**Endpoint:** `GET /api/users`

**Descripción:** Lista todos los usuarios del sistema.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Response 200:**
```json
{
  "users": [
    {
      "id": "...",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "superadmin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "...",
      "name": "Agent One",
      "email": "agent@example.com",
      "role": "agent",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

#### 6.2.6 Obtener Usuario por ID (Admin)

**Endpoint:** `GET /api/users/:id`

**Descripción:** Obtiene un usuario específico por su ID.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Parámetros:**
- `id`: UUID del usuario

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Agent One",
  "email": "agent@example.com",
  "role": "agent",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Usuario no encontrado

#### 6.2.7 Actualizar Usuario (Admin)

**Endpoint:** `PUT /api/users/:id`

**Descripción:** Actualiza cualquier usuario (solo superadmin).

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Parámetros:**
- `id`: UUID del usuario

**Request Body:**
```json
{
  "name": "Nombre Actualizado",
  "email": "actualizado@example.com",
  "password": "newpass123",
  "role": "superadmin"
}
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nombre Actualizado",
  "email": "actualizado@example.com",
  "role": "superadmin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### 6.2.8 Eliminar Usuario (Admin)

**Endpoint:** `DELETE /api/users/:id`

**Descripción:** Elimina (soft delete) cualquier usuario.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Parámetros:**
- `id`: UUID del usuario

**Response:** `204 No Content`

### 6.3 Propiedades

#### 6.3.1 Listar Propiedades (Público)

**Endpoint:** `GET /api/properties`

**Descripción:** Lista todas las propiedades activas (endpoint público).

**Autenticación:** No requerida

**Response 200:**
```json
{
  "properties": [
    {
      "id": "...",
      "title": "Casa moderna en el centro",
      "description": "Hermosa casa de 3 pisos",
      "price": 250000,
      "location": "Calle 123 #45-67, Bogotá",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 120,
      "imageUrls": ["https://example.com/image1.jpg"],
      "ownerId": "...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### 6.3.2 Obtener Propiedad (Público)

**Endpoint:** `GET /api/properties/:id`

**Descripción:** Obtiene los detalles de una propiedad específica.

**Autenticación:** No requerida

**Parámetros:**
- `id`: UUID de la propiedad

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Casa moderna en el centro",
  "description": "Hermosa casa de 3 pisos con acabados de lujo",
  "price": 250000,
  "location": "Calle 123 #45-67, Bogotá",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 120,
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "ownerId": "...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Propiedad no encontrada

#### 6.3.3 Crear Propiedad (Agente)

**Endpoint:** `POST /api/properties/agent`

**Descripción:** Crea una nueva propiedad (auto-asignación como owner).

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Request Body:**
```json
{
  "title": "Casa moderna en el centro",
  "description": "Hermosa casa de 3 pisos",
  "price": 250000,
  "location": "Calle 123 #45-67, Bogotá",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 120,
  "imageUrls": ["https://example.com/image1.jpg"]
}
```

**Validaciones:**
- `title`: string, máximo 120 caracteres, requerido
- `description`: string, requerido
- `price`: número, requerido
- `location`: string, requerido
- `bedrooms`: número positivo, requerido
- `bathrooms`: número positivo, requerido
- `area`: número positivo, requerido
- `imageUrls`: array de strings (opcional)

**Response 201:**
```json
{
  "id": "...",
  "title": "Casa moderna en el centro",
  "description": "Hermosa casa de 3 pisos",
  "price": 250000,
  "location": "Calle 123 #45-67, Bogotá",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 120,
  "imageUrls": ["https://example.com/image1.jpg"],
  "ownerId": "<id_del_agente_autenticado>",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 6.3.4 Actualizar Propiedad (Agente)

**Endpoint:** `PUT /api/properties/agent/:id`

**Descripción:** Actualiza una propiedad propia.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Parámetros:**
- `id`: UUID de la propiedad

**Request Body:** Campos opcionales
```json
{
  "title": "Casa moderna actualizada",
  "price": 280000
}
```

**Response 200:** Propiedad actualizada

**Errores:**
- `403 Forbidden`: No es el owner de la propiedad
- `404 Not Found`: Propiedad no encontrada

#### 6.3.5 Eliminar Propiedad (Agente)

**Endpoint:** `DELETE /api/properties/agent/:id`

**Descripción:** Elimina (soft delete) una propiedad propia y sus tareas.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Parámetros:**
- `id`: UUID de la propiedad

**Response:** `204 No Content`

**Nota:** También elimina (soft delete) todas las tareas asociadas en cascada.

**Errores:**
- `403 Forbidden`: No es el owner de la propiedad

#### 6.3.6 Crear Propiedad (Admin)

**Endpoint:** `POST /api/properties/admin`

**Descripción:** Crea una propiedad y asigna owner.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Request Body:**
```json
{
  "title": "Casa moderna en el centro",
  "description": "Hermosa casa",
  "price": 250000,
  "location": "Calle 123",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 120,
  "imageUrls": ["url"],
  "ownerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 201:** Propiedad creada

**Errores:**
- `404 Not Found`: Owner no encontrado

#### 6.3.7 Actualizar Propiedad (Admin)

**Endpoint:** `PUT /api/properties/admin/:id`

**Descripción:** Actualiza cualquier propiedad.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Request Body:** Campos opcionales, incluyendo `ownerId`

**Response 200:** Propiedad actualizada

#### 6.3.8 Eliminar Propiedad (Admin)

**Endpoint:** `DELETE /api/properties/admin/:id`

**Descripción:** Elimina cualquier propiedad.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Response:** `204 No Content`

### 6.4 Tareas

#### 6.4.1 Listar Tareas (Agente)

**Endpoint:** `GET /api/tasks/agent`

**Descripción:** Lista todas las tareas de propiedades del agente.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Response 200:**
```json
{
  "tasks": [
    {
      "id": "...",
      "title": "Reparar puerta principal",
      "description": "La puerta necesita ajuste",
      "isCompleted": false,
      "propertyId": "...",
      "assignedToId": "...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### 6.4.2 Crear Tarea (Agente)

**Endpoint:** `POST /api/tasks/agent`

**Descripción:** Crea una tarea en una propiedad propia.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Request Body:**
```json
{
  "title": "Reparar puerta principal",
  "description": "La puerta necesita ajuste en las bisagras",
  "propertyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validaciones:**
- `title`: string, máximo 120 caracteres, requerido
- `description`: string, requerido
- `propertyId`: UUID, requerido

**Response 201:**
```json
{
  "id": "...",
  "title": "Reparar puerta principal",
  "description": "La puerta necesita ajuste en las bisagras",
  "isCompleted": false,
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "assignedToId": "<id_del_agente>",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `403 Forbidden`: La propiedad no pertenece al agente
- `404 Not Found`: Propiedad no encontrada

#### 6.4.3 Obtener Tarea (Agente)

**Endpoint:** `GET /api/tasks/agent/:id`

**Descripción:** Obtiene una tarea específica de sus propiedades.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Parámetros:**
- `id`: UUID de la tarea

**Response 200:** Datos de la tarea

**Errores:**
- `403 Forbidden`: La tarea no pertenece al agente
- `404 Not Found`: Tarea no encontrada

#### 6.4.4 Listar Tareas por Propiedad (Agente)

**Endpoint:** `GET /api/tasks/agent/property/:propertyId`

**Descripción:** Lista tareas de una propiedad específica.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Parámetros:**
- `propertyId`: UUID de la propiedad

**Response 200:**
```json
{
  "tasks": [ ... ],
  "total": 2
}
```

**Errores:**
- `403 Forbidden`: La propiedad no pertenece al agente

#### 6.4.5 Actualizar Tarea (Agente)

**Endpoint:** `PUT /api/tasks/agent/:id`

**Descripción:** Actualiza una tarea propia.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Request Body:** Campos opcionales
```json
{
  "title": "Tarea actualizada",
  "description": "Nueva descripción",
  "isCompleted": true
}
```

**Response 200:** Tarea actualizada

#### 6.4.6 Eliminar Tarea (Agente)

**Endpoint:** `DELETE /api/tasks/agent/:id`

**Descripción:** Elimina (soft delete) una tarea propia.

**Autenticación:** Bearer Token requerido

**Roles:** `agent`

**Response:** `204 No Content`

#### 6.4.7 Listar Tareas (Admin)

**Endpoint:** `GET /api/tasks/admin`

**Descripción:** Lista todas las tareas del sistema.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Response 200:** Lista completa de tareas

#### 6.4.8 Crear Tarea (Admin)

**Endpoint:** `POST /api/tasks/admin`

**Descripción:** Crea una tarea en cualquier propiedad.

**Autenticación:** Bearer Token requerido

**Roles:** `superadmin`

**Request Body:**
```json
{
  "title": "Tarea administrativa",
  "description": "Descripción",
  "propertyId": "...",
  "assignedToId": "..."
}
```

**Response 201:** Tarea creada

#### 6.4.9 - 6.4.14 Otros Endpoints Admin

Similar a los endpoints de agente, pero sin restricciones de ownership:
- `GET /api/tasks/admin/:id`
- `GET /api/tasks/admin/property/:propertyId`
- `PUT /api/tasks/admin/:id`
- `DELETE /api/tasks/admin/:id`

---

## 7. Testing y Cobertura

### 7.1 Estrategia de Testing

#### 7.1.1 Tipos de Tests

1. **Tests Unitarios (Jest)**
   - Services
   - Guards
   - Strategy
   - Models

2. **Tests de Integración (Supertest)**
   - Controllers
   - Flujos completos E2E
   - Validación de autenticación
   - Validación de autorización

#### 7.1.2 Configuración de Jest

**Archivo:** `package.json`

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.spec.ts",
      "!**/*.module.ts",
      "!**/*.dto.ts",
      "!**/dto/**",
      "!**/dtos/**",
      "!main.ts",
      "!app.module.ts",
      "!**/constants.ts",
      "!**/*.decorator.ts",
      "!database/database.module.ts",
      "!seed/seed.service.ts",
      "!seed/seed.module.ts"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    }
  }
}
```

### 7.2 Tests Unitarios

#### 7.2.1 AuthService

**Archivo:** `src/auth/auth.service.spec.ts`

**Tests implementados:**
- ✅ Validación de usuario con password correcto
- ✅ Rechazo de password incorrecto
- ✅ Generación correcta de JWT token
- ✅ Registro de usuario con hash de password
- ✅ Prevención de duplicados por email

**Cobertura:** 100% statements, 90.9% branches

#### 7.2.2 UserService

**Archivo:** `src/users/user.service.spec.ts`

**Tests implementados:**
- ✅ Creación de usuario con hash de password
- ✅ Búsqueda de usuario por ID
- ✅ Búsqueda de usuario por email
- ✅ Actualización de perfil
- ✅ Soft delete de usuario
- ✅ Listado de usuarios
- ✅ Excepciones cuando usuario no existe

**Cobertura:** 100% statements

#### 7.2.3 PropertyService

**Archivo:** `src/properties/property.service.spec.ts`

**Tests implementados:**
- ✅ Listado público de propiedades
- ✅ Creación de propiedad por agente
- ✅ Creación de propiedad por admin con ownerId
- ✅ Actualización solo por owner
- ✅ Validación de ownership en updates
- ✅ Soft delete con cascada a tareas
- ✅ Excepciones de permiso

**Cobertura:** 100% statements

#### 7.2.4 TaskService

**Archivo:** `src/tasks/task.service.spec.ts`

**Tests implementados:**
- ✅ Listado de tareas por agente
- ✅ Creación de tarea en propiedad propia
- ✅ Validación de ownership de propiedad
- ✅ Asignación automática al agente
- ✅ Actualización de tareas propias
- ✅ Soft delete de tareas
- ✅ Admin puede gestionar todas las tareas

**Cobertura:** 91.01% statements

#### 7.2.5 Guards

**Archivos:**
- `src/auth/jwt-auth.guard.spec.ts`
- `src/auth/roles.guard.spec.ts`

**Tests implementados:**
- ✅ JWT Guard permite acceso con token válido
- ✅ JWT Guard bloquea sin token
- ✅ JWT Guard permite rutas @Public()
- ✅ Roles Guard valida roles correctamente
- ✅ Roles Guard permite acceso sin roles requeridos
- ✅ Roles Guard bloquea roles incorrectos

**Cobertura:** 100% statements

#### 7.2.6 JWT Strategy

**Archivo:** `src/auth/jwt.strategy.spec.ts`

**Tests implementados:**
- ✅ Validación de payload JWT
- ✅ Extracción de usuario del payload
- ✅ Rechazo de usuarios inexistentes
- ✅ Formato correcto del objeto user

**Cobertura:** 100% statements

### 7.3 Tests E2E

#### 7.3.1 Auth E2E

**Archivo:** `test/auth.e2e-spec.ts`

**Tests implementados (12 tests):**
- ✅ Registro de usuario como agente
- ✅ Validación de email
- ✅ Prevención de emails duplicados
- ✅ Login con credenciales válidas
- ✅ Generación de JWT en login
- ✅ Rechazo de credenciales inválidas
- ✅ Logout con token
- ✅ Logout requiere autenticación

#### 7.3.2 Users E2E

**Archivo:** `test/users.e2e-spec.ts`

**Tests implementados (20 tests):**
- ✅ GET /users/me retorna perfil
- ✅ PUT /users/me actualiza perfil
- ✅ DELETE /users/me elimina cuenta
- ✅ POST /users crea usuario (admin)
- ✅ GET /users lista usuarios (admin)
- ✅ GET /users/:id obtiene usuario (admin)
- ✅ PUT /users/:id actualiza usuario (admin)
- ✅ DELETE /users/:id elimina usuario (admin)
- ✅ Agentes no pueden acceder a endpoints admin
- ✅ Autenticación requerida en todos

#### 7.3.3 Properties E2E

**Archivo:** `test/properties.e2e-spec.ts`

**Tests implementados (17 tests):**
- ✅ GET /properties público
- ✅ GET /properties/:id público
- ✅ POST /properties/agent crea con auto-asignación
- ✅ PUT /properties/agent solo propias
- ✅ DELETE /properties/agent solo propias
- ✅ Agentes no pueden modificar otras propiedades
- ✅ POST /properties/admin con ownerId
- ✅ PUT /properties/admin todas
- ✅ DELETE /properties/admin todas
- ✅ Cascada de soft delete a tareas

#### 7.3.4 Tasks E2E

**Archivo:** `test/tasks.e2e-spec.ts`

**Tests implementados (32 tests):**
- ✅ GET /tasks/agent lista tareas propias
- ✅ POST /tasks/agent crea en propiedad propia
- ✅ Asignación automática al agente
- ✅ GET /tasks/agent/:id solo propias
- ✅ GET /tasks/agent/property/:id de propiedad propia
- ✅ PUT /tasks/agent/:id solo propias
- ✅ DELETE /tasks/agent/:id solo propias
- ✅ Agentes no pueden acceder a tareas de otros
- ✅ GET /tasks/admin todas las tareas
- ✅ POST /tasks/admin en cualquier propiedad
- ✅ CRUD completo de admin sin restricciones

### 7.4 Resultados de Cobertura

#### 7.4.1 Resumen General

```
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   94.34 |    79.07 |   84.29 |   95.29 |
```

✅ **Objetivo cumplido:** >80% de cobertura

#### 7.4.2 Desglose por Módulo

**Auth (100%)**
```
auth.controller.ts |     100 |    77.27 |     100 |     100 |
auth.service.ts    |     100 |     90.9 |     100 |     100 |
jwt-auth.guard.ts  |     100 |    83.33 |     100 |     100 |
jwt.strategy.ts    |     100 |      100 |     100 |     100 |
roles.guard.ts     |     100 |     87.5 |     100 |     100 |
```

**Properties (94.73%)**
```
property.controller.ts |   100 |       75 |     100 |     100 |
property.model.ts      | 77.77 |    81.25 |       0 |    82.6 |
property.service.ts    |   100 |    82.14 |     100 |     100 |
```

**Tasks (90.47%)**
```
task.controller.ts |   100 |       75 |     100 |     100 |
task.model.ts      | 72.72 |       85 |       0 |   77.77 |
task.service.ts    | 91.01 |    76.59 |   95.83 |    90.8 |
```

**Users (94.59%)**
```
user.controller.ts |   100 |       76 |     100 |     100 |
user.model.ts      | 78.57 |       80 |   14.28 |   83.33 |
user.service.ts    |   100 |    89.47 |     100 |     100 |
```

#### 7.4.3 Total de Tests

- **Tests Unitarios:** 148 tests
- **Tests E2E:** 81 tests
- **Total:** 229 tests
- **Todos pasando:** ✅

### 7.5 CI/CD con GitHub Actions

**Archivo:** `.github/workflows/test.yml`

**Workflow configurado:**
1. Checkout del código
2. Setup de Node.js 20.x
3. Instalación de dependencias
4. Ejecución de linter
5. Ejecución de tests unitarios
6. Ejecución de tests E2E
7. Generación de reporte de coverage

**Triggers:**
- Push a `main` o `develop`
- Pull requests a `main`

**Estado:** ✅ Todos los workflows pasando

---

## 8. Conclusiones

### 8.1 Cumplimiento de Requisitos

El proyecto cumple satisfactoriamente con todos los requisitos establecidos:

✅ **Seed (5%):** SeedService implementado con datos iniciales completos y idempotente.

✅ **Autenticación (5%):** Sistema JWT robusto con:
- Generación segura de tokens
- Validación automática en rutas protegidas
- Hash de passwords con bcrypt
- Estrategia de Passport configurada

✅ **Autorización (5%):** Sistema completo de roles con:
- 2 roles diferenciados (superadmin, agent)
- Guards personalizados globales
- Validación de ownership en recursos
- Decoradores @Roles() y @Public()

✅ **Pruebas (25%):** Coverage del 94.34% que incluye:
- 148 tests unitarios
- 81 tests E2E
- Cobertura de todos los módulos críticos
- Tests de autorización y autenticación

✅ **Persistencia (10%):** PostgreSQL con TypeORM:
- 3 entidades relacionadas
- Soft deletes en todas las entidades
- Migraciones automáticas
- Relaciones correctamente establecidas

✅ **Funcionalidades (25%):** CRUD completo de:
- Usuarios con gestión de perfil
- Propiedades con endpoints públicos y privados
- Tareas con asignación automática
- Validaciones robustas en todos los endpoints

✅ **GitHub Actions:** CI/CD configurado y funcionando

✅ **Swagger:** Documentación completa con ejemplos

### 8.2 Características Destacadas

1. **Arquitectura Modular:** Código organizado y mantenible
2. **Soft Deletes:** Preservación de datos con posibilidad de recuperación
3. **Validaciones Robustas:** class-validator en todos los DTOs
4. **Ownership Validation:** No solo roles, sino también propiedad de recursos
5. **Coverage Superior:** 94.34% supera ampliamente el 80% requerido
6. **Documentación Completa:** Swagger con ejemplos y descripciones

### 8.3 Tecnologías y Mejores Prácticas

- ✅ TypeScript para type-safety
- ✅ Dependency Injection de NestJS
- ✅ Separación de responsabilidades (Controllers, Services, Models)
- ✅ DTOs para validación y documentación
- ✅ Guards para seguridad
- ✅ Interceptors y Pipes para transformaciones
- ✅ Testing exhaustivo
- ✅ CI/CD automatizado

### 8.4 Próximos Pasos

Para completar el 100% del proyecto:

1. **Despliegue (15%):**
   - Desplegar en Railway o Render
   - Configurar base de datos en la nube
   - Configurar variables de entorno
   - Verificar funcionamiento en producción

2. **Pipeline de Deployment:**
   - Configurar workflow de deployment automático
   - Integración con Railway/Render

3. **Bonus (Opcional):**
   - Implementar 2FA (Two-Factor Authentication)
   - Agregar paginación avanzada
   - Implementar filtros y búsquedas

### 8.5 Lecciones Aprendidas

1. **NestJS:** Excelente framework con arquitectura clara y modular
2. **TypeORM:** Poderoso ORM con soporte completo para relaciones
3. **Testing:** Fundamental para mantener calidad del código
4. **Swagger:** Facilita enormemente la documentación y pruebas
5. **Guards:** Pattern eficiente para seguridad transversal

---

## Anexos

### A. Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Linting
npm run lint

# Build
npm run build
npm run start:prod

# Base de datos
docker-compose up -d
docker-compose down
```

### B. Variables de Entorno

```env
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=inmobiliaria_db
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRATION=1d
```

### C. Usuarios de Prueba

- **Superadmin:** admin@example.com / admin1234
- **Agente 1:** agent@example.com / agent1234
- **Agente 2:** agent.lisa@example.com / agentlisa1234

### D. URLs Importantes

- **Aplicación:** http://localhost:3001
- **API Base:** http://localhost:3001/api
- **Swagger:** http://localhost:3001/api/docs
- **Repositorio:** [GitHub URL]

---

**Fin del Informe**

**Fecha:** Octubre 2024  
**Proyecto:** Real Estate API - NestJS  
**Curso:** Computación 3

**Equipo de Desarrollo:**
- Juan Esteban Ruiz
- Juan David Quintero
- Juan Andrés Cano

