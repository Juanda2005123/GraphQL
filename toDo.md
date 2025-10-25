# Plan de Desarrollo - Real Estate API con NestJS

## 📋 Checklist de Desarrollo

### 1. Setup Inicial
- [ ] Crear proyecto NestJS con CLI
- [ ] Instalar dependencias (TypeORM, PostgreSQL, JWT, Passport, Bcrypt, Config, Class-validator)
- [ ] Crear repositorio en GitHub
- [ ] Hacer commit inicial

### 2. Configuración de GitHub Actions (CI/CD)
- [ ] Crear carpeta `.github/workflows/`
- [ ] Configurar archivo `test.yml` con workflow básico
- [ ] Configurar ejecución de tests automáticos en push
- [ ] Configurar linter automático
- [ ] Verificar que el workflow funcione (✅ verde en GitHub)
- [ ] Configurar coverage threshold (80%)

### 3. Configuración de Base de Datos
- [ ] Configurar TypeORM con PostgreSQL
- [ ] Crear archivo `.env` con credenciales
- [ ] Configurar `ConfigModule` para variables de entorno
- [ ] Verificar conexión a la base de datos

**Documentación:** docs.nestjs.com/techniques/database

### 4. Crear Entidades Base
- [ ] Crear `User` entity con soft delete
- [ ] Crear `Property` entity con soft delete
- [ ] Crear `Task` entity con soft delete
- [ ] Definir relaciones entre entidades (User → Property → Task)
- [ ] Añadir decoradores de validación

**Documentación:** docs.nestjs.com/techniques/database

### 5. Setup de Swagger
- [ ] Instalar `@nestjs/swagger`
- [ ] Configurar Swagger en `main.ts`
- [ ] Configurar Bearer Auth para JWT
- [ ] Verificar que `/api` muestre la documentación

**Documentación:** docs.nestjs.com/recipes/swagger

### 6. Módulo de Autenticación
- [ ] Crear módulo `auth`
- [ ] Implementar JWT Strategy
- [ ] Crear Auth Service (register, login, hash passwords con bcrypt)
- [ ] Crear JWT Guard
- [ ] Crear endpoints `/auth/register` y `/auth/login`
- [ ] Documentar endpoints con decoradores Swagger

**Documentación:** docs.nestjs.com/security/authentication

### 7. Autenticación de Dos Factores (2FA)
- [ ] Instalar librería para 2FA (`speakeasy` o `otplib`)
- [ ] Añadir campos `twoFactorSecret` y `twoFactorEnabled` a User entity
- [ ] Crear endpoint para generar QR code
- [ ] Crear endpoint para habilitar 2FA
- [ ] Crear endpoint para verificar código 2FA
- [ ] Modificar login para validar 2FA cuando esté habilitado
- [ ] Documentar endpoints 2FA en Swagger

### 8. Módulo de Usuarios
- [ ] Crear módulo `users`
- [ ] CRUD básico de usuarios
- [ ] Implementar soft delete
- [ ] Implementar hard delete (solo superadmin puede elegir)
- [ ] Añadir validaciones con class-validator
- [ ] Documentar endpoints con Swagger

**Documentación:** docs.nestjs.com/techniques/validation

### 9. Sistema de Autorización
- [ ] Crear Roles Guard personalizado
- [ ] Crear decorador `@Roles()` para metadata
- [ ] Crear decorador `@CurrentUser()` para obtener usuario del request
- [ ] Implementar lógica de ownership (agente solo accede a sus recursos)
- [ ] Probar que los permisos funcionen correctamente

**Documentación:** docs.nestjs.com/security/authorization, docs.nestjs.com/guards

### 10. Módulo de Properties
- [ ] Crear módulo `properties`
- [ ] Implementar POST (agente: owner automático, superadmin: asigna owner)
- [ ] Implementar GET (público, sin autenticación)
- [ ] Implementar PUT (agente: solo sus propiedades, superadmin: todas)
- [ ] Implementar DELETE (agente: soft delete sus propiedades, superadmin: elige soft/hard)
- [ ] Aplicar Guards según rol
- [ ] Documentar endpoints con Swagger

### 11. Módulo de Tasks
- [ ] Crear módulo `tasks`
- [ ] Implementar POST (asignar automáticamente a owner de property)
- [ ] Implementar GET (agente: solo sus tareas, superadmin: todas)
- [ ] Implementar PUT (agente: solo sus tareas, superadmin: todas)
- [ ] Implementar DELETE (agente: soft delete, superadmin: elige soft/hard)
- [ ] Validar que solo se creen tareas para properties existentes
- [ ] Documentar endpoints con Swagger

### 12. Seed de Base de Datos
- [ ] Crear SeedService en módulo `database`
- [ ] Crear usuario superadmin por defecto
- [ ] Crear algunos agentes de ejemplo
- [ ] Crear propiedades de prueba
- [ ] Crear tareas de prueba
- [ ] Crear endpoint `/seed` o comando `npm run seed`
- [ ] Documentar endpoint seed en Swagger (si aplica)

### 13. Testing Unitario
- [ ] Escribir tests para AuthService
- [ ] Escribir tests para UsersService
- [ ] Escribir tests para PropertiesService
- [ ] Escribir tests para TasksService
- [ ] Escribir tests para Guards personalizados
- [ ] Verificar que todos los tests pasen

**Documentación:** docs.nestjs.com/fundamentals/testing

### 14. Testing de Integración (E2E)
- [ ] Configurar Supertest
- [ ] Crear base de datos de test
- [ ] Escribir tests E2E para autenticación
- [ ] Escribir tests E2E para properties
- [ ] Escribir tests E2E para tasks
- [ ] Escribir tests E2E para autorización (roles y ownership)
- [ ] Verificar que todos los tests E2E pasen

### 15. Coverage y CI Final
- [ ] Ejecutar `npm run test:cov`
- [ ] Verificar que coverage sea >= 80%
- [ ] Ajustar tests si coverage es menor
- [ ] Actualizar GitHub Actions para reportar coverage
- [ ] Verificar que el CI pase con todos los tests

### 16. Preparación para Deployment
- [ ] Crear archivo `.env.production` de ejemplo
- [ ] Configurar variables de entorno para producción
- [ ] Añadir scripts de build en `package.json`
- [ ] Configurar CORS si es necesario
- [ ] Probar build de producción localmente

**Documentación:** docs.nestjs.com/deployment

### 17. Deployment
- [ ] Crear cuenta en Railway (o plataforma elegida)
- [ ] Crear base de datos PostgreSQL en la nube
- [ ] Configurar variables de entorno en Railway
- [ ] Hacer deploy de la aplicación
- [ ] Ejecutar seed en producción
- [ ] Verificar que la API funcione en producción
- [ ] Verificar que Swagger funcione en producción (`/api`)

### 18. Documentación Final
- [ ] Crear README.md completo del proyecto
- [ ] Documentar cómo levantar el proyecto localmente
- [ ] Documentar variables de entorno necesarias
- [ ] Documentar endpoints principales
- [ ] Incluir URL de la API desplegada
- [ ] Incluir URL de Swagger en producción
- [ ] Exportar colección de Postman (JSON)

### 19. Entrega
- [ ] Verificar que todos los requisitos estén cumplidos
- [ ] Verificar que GitHub Actions esté funcionando
- [ ] Verificar coverage >= 80%
- [ ] Verificar que la aplicación esté desplegada
- [ ] Preparar informe final (si es requerido)
- [ ] Hacer commit final
- [ ] Entregar proyecto

---

## 📚 Recursos de Documentación

### NestJS Oficial
- **Inicio:** docs.nestjs.com
- **Database:** docs.nestjs.com/techniques/database
- **Authentication:** docs.nestjs.com/security/authentication
- **Authorization:** docs.nestjs.com/security/authorization
- **Guards:** docs.nestjs.com/guards
- **Validation:** docs.nestjs.com/techniques/validation
- **Testing:** docs.nestjs.com/fundamentals/testing
- **Swagger:** docs.nestjs.com/recipes/swagger
- **Deployment:** docs.nestjs.com/deployment

### Recursos Complementarios
- **GitHub Actions CI/CD**
- **Soft Delete con TypeORM**
- **Seeding en NestJS**
- **2FA Implementation**
- **Supertest para E2E testing**
- **Railway Deployment Guide**

---

## ✅ Requisitos del Proyecto

### Obligatorios
- [x] Seed de base de datos (5%)
- [x] Autenticación JWT (5%)
- [x] Autorización por roles (5%)
- [x] Persistencia PostgreSQL + TypeORM (10%)
- [x] Testing unitario e integración >= 80% coverage (25%)
- [x] Deployment funcional (15%)
- [x] Swagger en todos los endpoints
- [x] GitHub Actions para ejecutar tests antes de push

### Opcionales (Bonus)
- [x] 2FA (Two-Factor Authentication)

---

## 📝 Notas Importantes

- Hacer commits frecuentes con mensajes descriptivos
- GitHub Actions ejecutará tests en cada push
- Mantener coverage >= 80% en todo momento
- Documentar endpoints en Swagger mientras se crean
- Probar la aplicación constantemente durante el desarrollo
- El soft delete debe ser por defecto, hard delete solo para superadmin
- Los agentes solo acceden a sus propios recursos
- Los superadmin tienen acceso total a todos los recursos