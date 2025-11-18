# 🚀 Guía de Despliegue en Render

## 📋 Pre-requisitos

- ✅ Proyecto en GitHub
- ✅ Cuenta en [render.com](https://render.com)

---

## 🎯 Pasos para Desplegar

### **1. Preparar el Repositorio**

Asegúrate de que todos los cambios estén en GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

### **2. Crear Cuenta en Render**

1. Ve a [render.com](https://render.com)
2. Haz click en **"Get Started for Free"**
3. Inicia sesión con GitHub

---

### **3. Crear Base de Datos PostgreSQL**

1. En el Dashboard de Render, click **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name:** `real-estate-db`
   - **Database:** `real_estate_db`
   - **User:** `real_estate_user`
   - **Region:** `Oregon (US West)` (o el más cercano)
   - **Instance Type:** `Free`
3. Click **"Create Database"**
4. **Importante:** Guarda la URL de conexión:
   - **Internal Database URL:** (Para conectar desde Render)
   - **External Database URL:** (Para conectar desde local si quieres)

📝 Ejemplo de URL:
```
postgresql://real_estate_user:password@dpg-xxxxx.oregon-postgres.render.com/real_estate_db
```

---

### **4. Crear Web Service (API NestJS)**

1. En el Dashboard, click **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub:
   - Selecciona **"real-estate-graphql-api"** o el nombre de tu repo
3. Configuración:
   - **Name:** `real-estate-graphql-api`
   - **Region:** `Oregon (US West)` (mismo que la DB)
   - **Branch:** `main`
   - **Root Directory:** (dejar vacío)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** `Free`

---

### **5. Configurar Variables de Entorno**

En la sección **"Environment Variables"**, agregar:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `tu_secreto_super_seguro_cambiar_esto` |
| `DATABASE_URL` | `[Copiar Internal Database URL de paso 3]` |
| `PORT` | `3001` (opcional, Render usa su propio puerto) |

**Ejemplo de `DATABASE_URL`:**
```
postgresql://real_estate_user:xxxxx@dpg-xxxxx.oregon-postgres.render.com/real_estate_db
```

---

### **6. Desplegar**

1. Click **"Create Web Service"**
2. Render empezará a construir y desplegar automáticamente
3. Espera 5-10 minutos (primera vez es más lento)
4. Verás logs en tiempo real:
   ```
   ==> Building...
   ==> Installing dependencies...
   ==> Running build command...
   ==> Starting application...
   ```

---

### **7. Verificar Despliegue**

Una vez completado, Render te dará una URL pública:

```
https://real-estate-graphql-api.onrender.com
```

**Probar GraphQL Playground:**
```
https://real-estate-graphql-api.onrender.com/graphql
```

**Probar Swagger:**
```
https://real-estate-graphql-api.onrender.com/api/docs
```

---

## 🧪 Prueba de Funcionamiento

### **1. Test de GraphQL Playground**

Accede a: `https://tu-app.onrender.com/graphql`

Ejecuta esta query de prueba:

```graphql
mutation Register {
  register(input: {
    name: "Test User"
    email: "test@example.com"
    password: "password123"
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

### **2. Test de Login**

```graphql
mutation Login {
  login(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      name
      email
    }
  }
}
```

---

## 🔧 Solución de Problemas Comunes

### **Error: "Application failed to start"**

**Solución:**
1. Revisa los logs en Render Dashboard
2. Verifica que `DATABASE_URL` esté configurada correctamente
3. Asegúrate de que `npm run build` funcione localmente

### **Error: "Database connection failed"**

**Solución:**
1. Verifica que la `DATABASE_URL` sea la **Internal Database URL**
2. Asegúrate de que la base de datos esté en la misma región que el web service
3. Revisa que `ssl: { rejectUnauthorized: false }` esté en `database.module.ts`

### **Error: "Module not found"**

**Solución:**
1. Asegúrate de que todas las dependencias estén en `package.json` (no en `devDependencies`)
2. Ejecuta localmente: `rm -rf node_modules && npm install`
3. Haz commit y push de nuevo

### **La aplicación se despliega pero GraphQL no funciona**

**Solución:**
1. Verifica que `main.ts` escuche en `0.0.0.0` (ya configurado)
2. Revisa los logs para ver si hay errores de GraphQL
3. Asegúrate de que CORS esté configurado para producción

---

## 🔄 Re-despliegues Automáticos

Cada vez que hagas `git push` a la rama `main`, Render:
1. ✅ Detecta los cambios
2. ✅ Ejecuta `npm install && npm run build`
3. ✅ Reinicia el servicio con `npm run start:prod`

**Nota:** El tier gratuito puede tardar 30-60 segundos en "despertar" después de inactividad.

---

## 📊 Monitoreo

En el Dashboard de Render puedes ver:
- 📈 Logs en tiempo real
- 🔄 Estado del despliegue
- 💾 Uso de recursos
- 🌐 Métricas de tráfico

---

## ✅ Checklist Final

```markdown
- [ ] Base de datos PostgreSQL creada en Render
- [ ] Web Service creado y conectado a GitHub
- [ ] Variables de entorno configuradas (NODE_ENV, JWT_SECRET, DATABASE_URL)
- [ ] Despliegue exitoso (sin errores en logs)
- [ ] GraphQL Playground accesible: https://tu-app.onrender.com/graphql
- [ ] Mutation de register funciona
- [ ] Mutation de login funciona
- [ ] URL agregada al README.md del proyecto
```

---

## 🎯 Próximos Pasos

1. ✅ Agregar URL de producción al `README.md`
2. ✅ Probar todas las queries y mutations en Postman
3. ✅ Actualizar colección Postman con URL de producción
4. ✅ Compartir URL con tu profesor/equipo

---

**¡Listo!** 🎉 Tu API GraphQL está desplegada en la nube.

**URL de Producción:** https://real-estate-graphql-api.onrender.com/graphql
