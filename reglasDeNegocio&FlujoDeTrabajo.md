
## 📡 Uso de la API (Endpoints)

### 1️⃣ Módulo de Usuarios 👥

#### 🔓 Autenticación Pública

| Método | Endpoint          | Descripción                               |
| ------ | ----------------- | ----------------------------------------- |
| `POST` | `/users/register` | Registra un nuevo usuario (rol: `agente`) |
| `POST` | `/users/login`    | Autentica usuario y devuelve JWT          |

#### 👤 Perfil Personal

| Método   | Endpoint    | Descripción                         | Auth |
| -------- | ----------- | ----------------------------------- | ---- |
| `GET`    | `/users/me` | Obtiene perfil del usuario actual   | ✅   |
| `PUT`    | `/users/me` | Actualiza perfil del usuario actual | ✅   |
| `DELETE` | `/users/me` | Elimina cuenta del usuario actual\* | ✅   |

#### ⚙️ Gestión Administrativa

| Método   | Endpoint     | Descripción              | Roles        |
| -------- | ------------ | ------------------------ | ------------ |
| `POST`   | `/users`     | Crea nuevo usuario       | `superadmin` |
| `GET`    | `/users`     | Lista todos los usuarios | `superadmin` |
| `GET`    | `/users/:id` | Obtiene usuario por ID   | `superadmin` |
| `PUT`    | `/users/:id` | Actualiza usuario por ID | `superadmin` |
| `DELETE` | `/users/:id` | Elimina usuario por ID\* | `superadmin` |

\*Solo si no tiene propiedades asignadas

---

### 2️⃣ Módulo de Propiedades 🏠

#### 🔓 Consultas Públicas

| Método | Endpoint          | Descripción                 |
| ------ | ----------------- | --------------------------- |
| `GET`  | `/properties`     | Lista todas las propiedades |
| `GET`  | `/properties/:id` | Obtiene propiedad por ID    |

#### 🏡 Gestión de Agente

| Método   | Endpoint                | Descripción              | Roles    |
| -------- | ----------------------- | ------------------------ | -------- |
| `POST`   | `/properties/agent`     | Crea nueva propiedad     | `agente` |
| `PUT`    | `/properties/agent/:id` | Actualiza su propiedad   | `agente` |
| `DELETE` | `/properties/agent/:id` | Elimina su propiedad\*\* | `agente` |

#### ⚙️ Gestión Administrativa

| Método   | Endpoint                | Descripción                      | Roles        |
| -------- | ----------------------- | -------------------------------- | ------------ |
| `POST`   | `/properties/admin`     | Crea propiedad (cualquier owner) | `superadmin` |
| `PUT`    | `/properties/admin/:id` | Actualiza cualquier propiedad    | `superadmin` |
| `DELETE` | `/properties/admin/:id` | Elimina cualquier propiedad\*\*  | `superadmin` |

\*\*Elimina automáticamente todas las tareas asociadas

---

### 3️⃣ Módulo de Tareas 📋

#### 👤 Gestión de Agente

| Método   | Endpoint                      | Descripción                | Roles    |
| -------- | ----------------------------- | -------------------------- | -------- |
| `GET`    | `/tasks/agent`                | Lista sus tareas asignadas | `agente` |
| `GET`    | `/tasks/agent/:id`            | Obtiene su tarea por ID    | `agente` |
| `GET`    | `/tasks/property/:propertyId` | Tareas de su propiedad     | `agente` |
| `POST`   | `/tasks/agent`                | Crea tarea en su propiedad | `agente` |
| `PUT`    | `/tasks/agent/:id`            | Actualiza su tarea         | `agente` |
| `DELETE` | `/tasks/agent/:id`            | Elimina su tarea           | `agente` |

#### ⚙️ Gestión Administrativa

| Método   | Endpoint                            | Descripción                       | Roles        |
| -------- | ----------------------------------- | --------------------------------- | ------------ |
| `GET`    | `/tasks/admin`                      | Lista todas las tareas            | `superadmin` |
| `GET`    | `/tasks/admin/:id`                  | Obtiene cualquier tarea           | `superadmin` |
| `GET`    | `/tasks/admin/property/:propertyId` | Tareas de cualquier propiedad     | `superadmin` |
| `POST`   | `/tasks/admin`                      | Crea tarea en cualquier propiedad | `superadmin` |
| `PUT`    | `/tasks/admin/:id`                  | Actualiza cualquier tarea         | `superadmin` |
| `DELETE` | `/tasks/admin/:id`                  | Elimina cualquier tarea           | `superadmin` |

---