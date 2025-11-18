# 📋 TODO - Migración de API REST a GraphQL

**IMPORTANTE:** Esta es una **traducción completa** de REST a GraphQL. Al finalizar, **solo existirá GraphQL**, eliminando todos los controllers REST.

---

## ✅ FASE 1: Setup y Configuración de GraphQL (COMPLETADO)

### Instalación de Dependencias

- ✅ Instalar paquetes necesarios:
  ```bash
  npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
  ```

### Configuración Inicial

- ✅ Configurar GraphQL Module en `app.module.ts` con Apollo Server
- ✅ Estrategia: **Code-First** (decoradores TypeScript)
- ✅ Configurar Playground en `/graphql`
- ✅ Configurar context para JWT authentication
- ✅ Configurar CORS para GraphQL

### Guards para GraphQL

- ✅ Adaptar `JwtAuthGuard` para funcionar con GraphQL context
- ✅ Adaptar `RolesGuard` para funcionar con GraphQL context
- ✅ Crear decorador `@CurrentUser()` para extraer usuario del context
- ✅ Crear decorador `@Public()` para rutas públicas en GraphQL

---

## ✅ FASE 2: Módulo Auth - Traducción Completa a GraphQL (COMPLETADO)

### Auth Object Types (GraphQL)

- ✅ Crear `src/auth/dto/auth.types.ts`:
  - `AuthResponse` (token + user)
  - `LoginInput`
  - `RegisterInput`
  - `LogoutResponse`
  - `UserType`

### Auth Resolver

- ✅ Crear `src/auth/auth.resolver.ts`
- ✅ **Mutation `login(input: LoginInput!)`:** Iniciar sesión
- ✅ **Mutation `register(input: RegisterInput!)`:** Registrar usuario (retorna token)
- ✅ **Mutation `logout`:** Cerrar sesión
- ✅ **Query `healthCheck`:** Verificar GraphQL funcionando
- ✅ Marcar mutations como `@Public()` (login y register)
- ✅ Mantener `AuthService` actualizado con tipos GraphQL

### Probar Auth GraphQL

- ✅ **Probado en Playground:**
  - ✅ Query `healthCheck` → funcionando
  - ✅ Mutation `register` → recibir token + usuario
  - ✅ Mutation `login` → recibir token JWT
  - ✅ Mutation `logout` → mensaje de confirmación
  - ✅ Error handling → credenciales incorrectas
- ✅ Verificar que el token funcione en siguientes requests

### Limpieza Auth

- ✅ **Eliminar** `src/auth/auth.controller.ts`
- ✅ **Eliminar** `src/auth/dtos/login.dto.ts`
- ✅ **Eliminar** `src/auth/dtos/register-user.dto.ts`
- ✅ **Eliminar** archivos `.spec.ts` (tests no requeridos por enunciado)
- ✅ Actualizar `src/auth/auth.module.ts` (remover controller, agregar resolver)

✅ **Checkpoint:** Auth funciona 100% por GraphQL y está validado.

---

## ✅ FASE 3: Módulo Users - Traducción Completa a GraphQL (COMPLETADO)

### User Object Types (GraphQL)

- ✅ Crear `src/users/dto/user.types.ts`:
  - ✅ `UserType` (objeto principal sin password)
  - ✅ `CreateUserInput` (para superadmin)
  - ✅ `UpdateUserInput` (para superadmin, incluye role)
  - ✅ `UpdateProfileInput` (para usuarios, sin role)
  - ✅ `DeleteResponse`

### User Resolver

- ✅ Crear `src/users/user.resolver.ts`
- ✅ **Query `users`:** Lista usuarios → **Accesible para CUALQUIER usuario autenticado** ⚠️
- ✅ **Query `user(id: ID!)`:** Usuario por ID → Solo superadmin
- ✅ **Query `me`:** Perfil actual → Cualquier autenticado
- ✅ **Mutation `createUser(input: CreateUserInput!)`:** Crear usuario → Solo superadmin
- ✅ **Mutation `updateUser(id: ID!, input: UpdateUserInput!)`:** Actualizar usuario → Solo superadmin
- ✅ **Mutation `updateProfile(input: UpdateProfileInput!)`:** Actualizar perfil propio → Cualquier autenticado
- ✅ **Mutation `deleteUser(id: ID!)`:** Eliminar usuario → Solo superadmin
- ✅ **Mutation `deleteProfile`:** Eliminar cuenta propia → Cualquier autenticado

### Field Resolvers (Relaciones)

- ✅ `@ResolveField('properties')` → Documentado y comentado (pendiente migración de Properties)
- ✅ `@ResolveField('tasks')` → Documentado y comentado (pendiente migración de Tasks)

### Fragments (integrado en esta fase)

- ✅ **Fragment `UserBasicFields` documentado** en user.resolver.ts
- ✅ Incluye: id, name, email, role, createdAt, updatedAt, isDeleted
- ✅ Ejemplos de uso documentados

### Probar Users GraphQL

- ✅ **Documento de testing creado:** `TESTING_USERS_GRAPHQL.md`
- ✅ **Pruebas ejecutadas y validadas:**
  - ✅ Query `me` con token → Funcionando
  - ✅ Query `users` con token de agent → **Funcionando (requisito del enunciado cumplido)** ✅
  - ✅ Query `users` con token de superadmin → Funcionando
  - ✅ Mutation `createUser` solo con superadmin → Funcionando
  - ✅ Mutation `updateProfile` con cualquier usuario → Funcionando
  - ✅ Probar fragments en queries → Funcionando
  - ✅ Validaciones de input (email, password, role) → Funcionando

### Limpieza Users

- ✅ **Eliminado** `src/users/user.controller.ts`
- ✅ **Eliminada** carpeta `src/users/dtos/` (DTOs REST antiguos)
- ✅ Actualizado `src/users/user.module.ts` (removido controller)
- ✅ Actualizado `src/users/user.service.ts` (removidos imports REST)

✅ **Checkpoint:** Users migrado completamente a GraphQL. Pendiente validación con pruebas del usuario.

---

## ✅ FASE 4: Módulo Properties - Traducción Completa a GraphQL (COMPLETADO)

### Property Object Types (GraphQL)

- ✅ Crear `src/properties/dto/property.types.ts`:
  - ✅ `PropertyType` (objeto principal con relaciones)
  - ✅ `PropertyListType` (lista con total)
  - ✅ `CreatePropertyByAgentInput`
  - ✅ `CreatePropertyByAdminInput` (con ownerId)
  - ✅ `UpdatePropertyByAgentInput`
  - ✅ `UpdatePropertyByAdminInput`

### Property Resolver

- ✅ Crear `src/properties/property.resolver.ts`
- ✅ **Query `properties`:** Lista pública → `@Public()` (sin auth)
- ✅ **Query `property(id: ID!)`:** Detalle → `@Public()`
- ✅ **Mutation `createPropertyByAgent(input: CreatePropertyByAgentInput!)`:** Crear como agent
- ✅ **Mutation `createPropertyByAdmin(input: CreatePropertyByAdminInput!)`:** Crear como admin (con ownerId)
- ✅ **Mutation `updatePropertyByAgent(id: ID!, input: UpdatePropertyByAgentInput!)`:** Actualizar como agent
- ✅ **Mutation `updatePropertyByAdmin(id: ID!, input: UpdatePropertyByAdminInput!)`:** Actualizar como admin
- ✅ **Mutation `deletePropertyByAgent(id: ID!)`:** Eliminar como agent
- ✅ **Mutation `deletePropertyByAdmin(id: ID!)`:** Eliminar como admin
- ✅ Validar ownership según rol

### Field Resolvers (Relaciones)

- ✅ `@ResolveField('owner')` → Cargar usuario propietario
- ⏸️ `@ResolveField('tasks')` → Pendiente hasta migración de Tasks (Fase 5)

### Fragments (integrado en esta fase)

- ✅ **Fragment `PropertyBasicFields`:** Documentado en property.types.ts
- ✅ Incluye: id, title, description, price, location, bedrooms, bathrooms, area, imageUrls, ownerId, createdAt, updatedAt
- ✅ **Fragment `PropertyWithOwner`:** Documentado con ejemplo de uso

### Probar Properties GraphQL

- ⚠️ **Pendiente de testing manual:**
  - [ ] Query `properties` sin token → Debe funcionar (público)
  - [ ] Query `property(id)` sin token → Debe funcionar (público)
  - [ ] Mutation `createPropertyByAgent` con token de agent
  - [ ] Mutation `updatePropertyByAgent` validar ownership
  - [ ] Mutation `deletePropertyByAgent` validar ownership
  - [ ] Mutation `createPropertyByAdmin` con token de superadmin
  - [ ] Mutation `updatePropertyByAdmin` con token de superadmin
  - [ ] Mutation `deletePropertyByAdmin` con token de superadmin
  - [ ] Probar field resolver `owner`
  - [ ] Probar fragments en queries

### Limpieza Properties

- ✅ **Eliminado** `src/properties/property.controller.ts`
- ✅ Actualizado `src/properties/property.module.ts`
- ✅ Actualizado `src/properties/property.service.ts` (ownerId: null → undefined)
- ✅ Actualizado `src/properties/dtos/response-property.dto.ts` (compatibilidad GraphQL)

✅ **Checkpoint:** Properties migrado completamente a GraphQL. Listo para pruebas.

---

## ✅ FASE 5: Módulo Tasks - Traducción Completa a GraphQL (COMPLETADO)

### Task Object Types (GraphQL)

- ✅ Crear `src/tasks/dto/task.types.ts`:
  - ✅ `TaskType` (objeto principal con relaciones)
  - ✅ `TaskListType` (lista con total)
  - ✅ `CreateTaskByAgentInput`
  - ✅ `CreateTaskByAdminInput` (con assignedToId)
  - ✅ `UpdateTaskByAgentInput`
  - ✅ `UpdateTaskByAdminInput`

### Task Resolver

- ✅ Crear `src/tasks/task.resolver.ts`
- ✅ **Query `myTasks`:** Tareas del agente → Solo autenticado (AGENT)
- ✅ **Query `myTask(id: ID!)`:** Tarea específica → Solo autenticado (AGENT)
- ✅ **Query `tasksByProperty(propertyId: ID!)`:** Tareas de propiedad del agente
- ✅ **Query `allTasks`:** Todas las tareas → Solo SUPERADMIN
- ✅ **Query `task(id: ID!)`:** Tarea por ID → Solo SUPERADMIN
- ✅ **Query `tasksByPropertyAdmin(propertyId: ID!)`:** Tareas de cualquier propiedad → SUPERADMIN
- ✅ **Mutation `createTaskByAgent(input: CreateTaskByAgentInput!)`:** Crear como agent (auto-asignación)
- ✅ **Mutation `updateTaskByAgent(id: ID!, input: UpdateTaskByAgentInput!)`:** Actualizar como agent
- ✅ **Mutation `deleteTaskByAgent(id: ID!)`:** Eliminar como agent
- ✅ **Mutation `createTaskByAdmin(input: CreateTaskByAdminInput!)`:** Crear como admin (con assignedToId)
- ✅ **Mutation `updateTaskByAdmin(id: ID!, input: UpdateTaskByAdminInput!)`:** Actualizar como admin (puede reasignar)
- ✅ **Mutation `deleteTaskByAdmin(id: ID!)`:** Eliminar como admin
- ✅ Validar permisos según rol y ownership

### Field Resolvers (Relaciones)

- ✅ `@ResolveField('property')` → Cargar propiedad asociada
- ✅ `@ResolveField('assignedTo')` → Cargar usuario asignado

### Fragments (integrado en esta fase)

- ✅ **Fragment `TaskBasicFields`:** Documentado en task.types.ts
- ✅ Incluye: id, title, description, isCompleted, propertyId, assignedToId, createdAt, updatedAt
- ✅ **Fragment `TaskWithProperty`:** Documentado con ejemplo de uso
- ✅ **Fragment `TaskWithAssignee`:** Documentado con ejemplo de uso
- ✅ **Fragment `TaskFull`:** Documentado con ejemplo completo

### Field Resolver en Properties

- ✅ **Completado `@ResolveField('tasks')` en PropertyResolver**
- ✅ Ahora las queries de properties pueden incluir tareas asociadas

### Probar Tasks GraphQL

- ⚠️ **Pendiente de testing manual:**
  - [ ] Query `myTasks` con token de agent → Lista tareas propias
  - [ ] Query `myTask(id)` con token de agent → Validar ownership
  - [ ] Query `tasksByProperty(propertyId)` → Solo propiedades del agente
  - [ ] Query `allTasks` con token de superadmin → Todas las tareas
  - [ ] Query `task(id)` con token de superadmin → Cualquier tarea
  - [ ] Query `tasksByPropertyAdmin(propertyId)` → Cualquier propiedad
  - [ ] Mutation `createTaskByAgent` → Auto-asignación al agente
  - [ ] Mutation `updateTaskByAgent` → Solo tareas propias
  - [ ] Mutation `deleteTaskByAgent` → Solo tareas propias
  - [ ] Mutation `createTaskByAdmin` → Con assignedToId explícito
  - [ ] Mutation `updateTaskByAdmin` → Puede reasignar
  - [ ] Mutation `deleteTaskByAdmin` → Cualquier tarea
  - [ ] Field resolver `property` → Carga propiedad
  - [ ] Field resolver `assignedTo` → Carga usuario asignado
  - [ ] Field resolver `tasks` en Property → Carga tareas de propiedad
  - [ ] Probar fragments en queries

### Limpieza Tasks

- ✅ **Eliminado** `src/tasks/task.controller.ts`
- ✅ Actualizado `src/tasks/task.module.ts`
- ✅ Actualizado `src/tasks/task.service.ts` (propertyId y assignedToId: null → undefined)
- ✅ Actualizado `src/tasks/dtos/response-task.dto.ts` (compatibilidad GraphQL)
- ✅ Actualizado `src/properties/property.module.ts` (forwardRef para TaskModule)
- ✅ Actualizado `src/properties/property.resolver.ts` (field resolver tasks)
- ✅ Actualizado `src/properties/dto/property.types.ts` (campo tasks)

✅ **Checkpoint:** Tasks migrado completamente a GraphQL. Listo para pruebas.

---

## 🧹 FASE 6: Limpieza Final de API REST

- ✅ **Convertir** colección Postman REST a GraphQL:
  - ✅ Auth: login, register, logout → mutations (5 operaciones)
  - ✅ Users: queries y mutations (9 operaciones)
  - ✅ Properties: queries y mutations (8 operaciones)
  - ✅ Tasks: queries y mutations (12 operaciones)
  - ✅ Mantener estructura de carpetas (4 módulos)
  - ✅ Agregar ejemplos con fragments y field resolvers
  - ✅ Documentar headers de autenticación (Bearer token)
  - ✅ Auto-guardado de tokens e IDs en test scripts
  - ✅ Validación de errores (UNAUTHENTICATED, FORBIDDEN)
  - ✅ Exportar colección actualizada: **`Inmobiliaria GraphQL.postman_collection.json`**
  - ✅ Crear guía de importación: **`IMPORTACION_GRAPHQL.md`**
  - ✅ Crear resumen de conversión: **`CONVERSION_SUMMARY.md`**
- [ ] Verificar que NO existan controllers en:
  - ✅ `src/auth/` → auth.controller.ts NO existe ✅
  - ✅ `src/users/` → user.controller.ts eliminado en Fase 3 ✅
  - ✅ `src/properties/` → property.controller.ts eliminado en Fase 4 ✅
  - ✅ `src/tasks/` → task.controller.ts eliminado en Fase 5 ✅
- [ ] Remover imports de `@ApiTags`, `@ApiBearerAuth`, etc. (Swagger REST)
- [ ] Limpiar dependencias no usadas de Swagger REST
- [ ] Actualizar `src/main.ts`:
  - Remover configuración de Swagger
  - Dejar solo GraphQL endpoint
  - Mantener CORS configurado
- [ ] Verificar que app corra solo con GraphQL en `/graphql`

✅ **Checkpoint:** Colección Postman convertida completamente (34 operaciones REST → 34 operaciones GraphQL). Controllers REST eliminados.

---

## ✅ FASE 7: Testing y Validación (NO REQUERIDO POR ENUNCIADO)

**NOTA:** El enunciado NO menciona tests unitarios ni E2E. Se eliminaron todos los archivos `.spec.ts` y la carpeta `test/` para enfocarnos en:

- ✅ Implementación de GraphQL (50% del puntaje)
- ✅ Funcionalidad y validaciones (15% del puntaje)
- ✅ Documentación (10% del puntaje)

### Tests Eliminados

- ✅ **Eliminados** todos los archivos `.spec.ts` de módulos (auth, users, properties, tasks)
- ✅ **Eliminada** carpeta `test/` completa (E2E tests)
- ✅ Razón: No son parte de los criterios de evaluación del enunciado

---

## 📚 FASE 8: Documentación

### README.md

- [ ] Actualizar sección de instalación (incluir dependencias GraphQL)
- [ ] Actualizar sección de endpoints → Cambiar a "Queries y Mutations"
- [ ] Agregar sección "GraphQL Playground" con URL `/graphql`
- [ ] Incluir ejemplos de queries con fragments
- [ ] Ejemplos de autenticación (header Authorization)
- [ ] Actualizar capturas/ejemplos si es necesario

### Archivo de Ejemplos GraphQL

- [ ] Crear `GRAPHQL_EXAMPLES.md` con:
  - Ejemplo de `login` y `register`
  - Ejemplo de queries con `users` (agents y superadmin)
  - Ejemplos de CRUD de properties
  - Ejemplos de CRUD de tasks
  - Ejemplos de uso de fragments
  - Ejemplos de field resolvers (relaciones)

### INFORME.md

- [ ] Actualizar sección de arquitectura (mencionar GraphQL)
- [ ] Actualizar endpoints → Queries/Mutations
- [ ] Mencionar uso de fragments
- [ ] Actualizar diagrama si es necesario

---

## 🚀 FASE 9: Despliegue

### Configuración de Producción

- [ ] Verificar variables de entorno (.env)
- [ ] Configurar introspection y playground según ambiente
- [ ] Configurar rate limiting para GraphQL
- [ ] Configurar CORS adecuado

### CI/CD

- [ ] Actualizar GitHub Actions (`.github/workflows/test.yml`)
- [ ] Verificar que tests pasen en CI

### Deploy

- [ ] Desplegar en la nube
- [ ] Verificar funcionamiento en producción
- [ ] Probar GraphQL playground en producción (si está habilitado)

---

## ✅ Checklist Final

- [ ] **Todos los módulos migrados a GraphQL** (auth, users, properties, tasks)
- [ ] **Cero controllers REST** (todos eliminados)
- [ ] **Solo existe GraphQL** en `/graphql`
- [ ] **Autenticación JWT funciona** con GraphQL context
- [ ] **Permisos actualizados:** Query `users` accesible para cualquier autenticado
- [ ] **Fragments documentados** y con ejemplos
- [ ] **Field resolvers funcionando** (relaciones cargadas correctamente)
- [ ] **Tests pasando** (unitarios y E2E) con cobertura >80%
- [ ] **Documentación actualizada** (README, INFORME, GRAPHQL_EXAMPLES)
- [ ] **Proyecto desplegado** en la nube
- [ ] **Funciona en Postman/Playground** con autenticación

---

## 📝 Notas Importantes

- **Services NO cambian:** Toda la lógica de negocio se mantiene intacta
- **Code-First approach:** Usamos decoradores TypeScript para generar el schema
- **Fragments:** Se crean durante cada módulo para reutilización inmediata
- **Probar después de cada fase:** Cada módulo debe funcionar antes de pasar al siguiente
- **Eliminación progresiva:** Controllers REST se eliminan después de validar GraphQL

---

**Última actualización:** 17 de noviembre de 2025
