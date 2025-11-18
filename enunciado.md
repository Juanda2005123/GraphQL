### Objetivo

El objetivo de este taller es traducir una aplicación backend existente que utiliza una API REST a una que utilice GraphQL. La nueva aplicación debe mantener todas las funcionalidades de la original, pero aprovechando las ventajas de GraphQL para mejorar la eficiencia y flexibilidad en la gestión de datos.

### Descripción de la Asignación

Tomar una aplicación backend existente que utiliza una API REST para la gestión de usuarios y comentarios, y traducirla a una API GraphQL utilizando Node.js y TypeScript. La nueva API debe permitir a los usuarios realizar operaciones CRUD sobre los usuarios y los comentarios, manejar la autenticación y gestionar roles específicos que controlen las acciones permitidas.

### Requisitos Funcionales

La tarea principal es traducir la aplicación existente de API REST a GraphQL. Se deben mantener las funcionalidades existentes con la siguiente modificación clave:

**Gestión de Usuarios:**
*   Los usuarios con rol de `superadmin` pueden crear, modificar y eliminar usuarios.
*   Implementar roles de usuario: `superadmin` y `usuario regular`.
*   **Modificación:** Cualquier usuario autenticado (con un JWT válido), sin importar su rol, debe poder ver la lista de otros usuarios. Sin embargo, solo el `superadmin` puede modificar o eliminar usuarios de esa lista.

**Módulo 1 – Gestión de Proyectos (o cualquier entidad principal):**
*   **Operaciones CRUD:**
    *   Los usuarios autenticados pueden crear, visualizar, modificar y eliminar sus **propios** proyectos.
    *   Los administradores (`superadmin`) podrán gestionar proyectos de **cualquier** usuario.
*   **Relación con Otros Módulos:** Los proyectos deben poder vincularse a elementos de otros módulos (por ejemplo, tareas, actividades, usuarios, etc.).

**Autenticación y Autorización:**
*   Implementar un sistema de registro y autenticación de usuarios utilizando JWT.
*   Proteger las operaciones CRUD con middleware de autenticación y autorización.
*   Los usuarios deben estar autenticados para realizar cualquier operación relacionada con usuarios, comentarios o reacciones.

### Entrega y Presentación

*   El código fuente debe estar en un repositorio de GitHub, con un README claro sobre cómo configurar y ejecutar el proyecto. Debe incluir una descripción de la funcionalidad, qué elementos no se alcanzaron a desarrollar y las dificultades encontradas.
*   El proyecto debe ser desplegado en la nube.
*   Se debe incluir un archivo (ej. una colección de Postman/Insomnia o similar) que permita revisar las funcionalidades implementadas.

### Criterios de Evaluación

*   **Implementación de GraphQL (50%):**
    *   **Consultas y Mutaciones (30%):** Implementación correcta de consultas y mutaciones para todas las operaciones CRUD.
    *   **Fragments (10%):** Uso efectivo de fragments para reutilizar partes de las consultas y evitar duplicación de código.
    *   **Manejo de Errores (10%):** Manejo efectivo de errores en las consultas y mutaciones.
*   **Calidad del Código y Uso de TypeScript (15%):** Código bien organizado, tipado fuertemente y comentado.
*   **Funcionalidad y Validaciones (15%):** Cumplimiento de todas las funcionalidades, incluyendo validaciones de entrada.
*   **Seguridad en Autenticación y Autorización (10%):** Seguridad en el acceso a rutas y operaciones CRUD.
*   **Documentación y Presentación (10%):** Documentación completa (README de ejecución, endpoints y tipos de datos) y presentación clara y detallada.


