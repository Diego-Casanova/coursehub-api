# CourseHub API

API NestJS para gestionar estudiantes, cursos y matrículas con PostgreSQL y
TypeORM. Los datos se almacenan en la base de datos y sobreviven al reinicio
de la API.

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 14 o superior, o Docker Desktop para ejecutar
  `docker compose up -d`.
- Una base de datos PostgreSQL accesible desde la API.

## Configuración

1. Copia `.env.example` como `.env`.
2. Completa `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_NAME`
   con los datos de tu PostgreSQL.
3. Configura `JWT_SECRET` con un secreto aleatorio de al menos 32 caracteres,
   `JWT_EXPIRES_IN` (por ejemplo `1h`) y `CORS_ORIGINS` como una lista separada
   por comas de orígenes exactos. El ejemplo permite `http://localhost:5173` y
   `http://127.0.0.1:5173` para desarrollo.
4. Si usas Docker Compose, configura también `POSTGRES_DB`,
   `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT`.
5. Instala dependencias y ejecuta la API:

```bash
npm install
npm run start:dev
```

La API acepta cualquier puerto definido en `PORT`; puedes usar `3000` o
`3001`. En PowerShell, puedes cambiarlo para una ejecución concreta:

```powershell
$env:PORT = "3000"; npm run start
$env:PORT = "3001"; npm run start
```

Si el puerto configurado está ocupado, la API intenta automáticamente el otro
puerto entre `3000` y `3001` y lo informa en los logs.

El servidor solo permite los orígenes listados en `CORS_ORIGINS`, y CORS anuncia
los métodos `GET`, `POST`, `PATCH` y `DELETE` y los encabezados `Content-Type`
y `Authorization`. En producción configura los orígenes HTTPS reales.

CORS solo controla qué páginas web pueden leer respuestas desde un navegador;
no bloquea llamadas desde Postman, scripts ni otros servidores y no concede
permisos. JWT, `JwtAuthGuard`, `RolesGuard` y las reglas de propiedad autorizan
cada operación en el servidor.

`synchronize` está habilitado únicamente cuando `NODE_ENV` no es `production`,
para desarrollo local. En producción, aplica manualmente los scripts SQL de
`requests/migrations`; el proyecto no tiene un ejecutor automático de
migraciones.

## Validación y errores

La aplicación limita cuerpos JSON y URL encoded a 1 MiB; los cuerpos mayores
responden 413. `ValidationPipe` global transforma, filtra y rechaza propiedades
desconocidas; los DTO inválidos responden 400.
Las búsquedas de recursos inexistentes responden 404 y los duplicados
responden 409 con `ConflictException`. El correo de estudiante y la pareja
estudiante-curso también tienen restricciones únicas en PostgreSQL para cubrir
condiciones de carrera.

El middleware `RequestLoggerMiddleware` registra método, ruta sin query,
estado HTTP y duración total de cada solicitud. `TimingInterceptor` mide la
duración de la ejecución del controlador, incluso cuando termina con error.
Ambos omiten encabezados, cuerpos, contraseñas y tokens. El filtro global
`HttpErrorFilter` devuelve errores con `statusCode`, `path`, `timestamp` y
`message`; las respuestas 500 ocultan los detalles internos. Las denegaciones
403 conservan un evento de auditoría con el id y rol del actor cuando están
disponibles.

## Endpoints

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| `POST` | `/students` | Crea un estudiante (solo admin) | 201, 400, 401, 403, 409 |
| `GET` | `/students` | Lista estudiantes; admite filtros | 200 |
| `GET` | `/students/:id` | Obtiene un estudiante | 200, 404 |
| `PATCH` | `/students/:id` | Actualiza un estudiante (solo admin) | 200, 400, 401, 403, 404, 409 |
| `PATCH` | `/students/:id/status` | Cambia `isActive` (solo admin) | 200, 400, 401, 403, 404 |
| `POST` | `/courses` | Crea curso (teacher/admin; Bearer JWT) | 201, 400, 401, 403 |
| `PATCH` | `/courses/:id` | Actualiza curso propio (teacher) o cualquiera (admin) | 200, 400, 401, 403, 404 |
| `DELETE` | `/courses/:id` | Elimina un curso (solo admin) | 200, 401, 403, 404 |
| `GET` | `/courses` | Lista cursos paginados; query `level`, `page`, `limit`, `sortBy` (`id`, `title`, `level`) y `order` (`ASC`, `DESC`) | 200, 400 |
| `GET` | `/courses/:id` | Obtiene un curso | 200, 400, 404 |
| `POST` | `/enrollments` | Crea matrícula (solo admin) | 201, 400, 401, 403, 404, 409 |
| `POST` | `/auth/register` | Registra una cuenta con correo normalizado y contraseña almacenada como hash | 201, 400, 409 |
| `POST` | `/auth/login` | Valida credenciales y devuelve `accessToken` y datos seguros del usuario | 200, 400, 401, 429 |
| `GET` | `/auth/me` | Devuelve la identidad autenticada y su rol (requiere Bearer JWT) | 200, 401 |
| `GET` | `/admin/users` | Lista cuentas (solo admin) | 200, 401, 403 |
| `PATCH` | `/admin/users/:id/role` | Cambia rol de cuenta (solo admin) | 200, 400, 401, 403, 404, 409 |
| `GET` | `/enrollments` | Lista matrículas paginadas; combina `search`, `studentId`, `courseId`, `activeOnly`, `page` y `limit` | 200, 400 |
| `GET` | `/enrollments/:id` | Obtiene una matrícula con estudiante y curso | 200, 400, 404 |
| `GET` | `/students/:studentId/enrollments` | Lista matrículas del estudiante | 200, 400, 404 |
| `GET` | `/courses/:courseId/enrollments` | Lista matrículas del curso | 200, 400, 404 |
| `DELETE` | `/enrollments/:id` | Cancela matrícula (solo admin) | 200, 400, 401, 403, 404 |

Las respuestas de matrículas incluyen información no sensible del estudiante
(`id`, `name`, `email`, `age`, `career`, `semester`, `isActive`) y del curso
(`id`, `title`, `level`); no se exponen credenciales.

Las cuentas se almacenan en `User`, separadas de `Students`. Cada cuenta tiene
un rol `student`, `teacher` o `admin`; el registro público asigna siempre el
rol de menor privilegio (`student`) y no acepta el rol desde el cuerpo. El correo
se recorta y convierte a minúsculas al registrarse o iniciar sesión.
`passwordHash` se excluye de las consultas habituales y nunca se devuelve por
HTTP. El inicio de sesión compara la contraseña con bcrypt y, solo si es
correcta, firma un JWT con `sub` y `email`; devuelve un token y datos seguros.
La estrategia Bearer valida firma y caducidad. `JWT_SECRET` (mínimo 32
caracteres) y `JWT_EXPIRES_IN` (por ejemplo `1h`) son obligatorios y se validan
al iniciar. El login incorrecto responde con el mismo error genérico 401.
`JwtAuthGuard` protege las rutas privadas. `RolesGuard` y `@Roles(...)` aplican
autorización por rol; una identidad válida sin permiso recibe 403. Los docentes
pueden crear cursos y modificar únicamente los cursos que poseen; solo los
administradores pueden borrarlos.
Los administradores pueden administrar cursos, estudiantes, matrículas y roles
de cuentas. Registro y login son públicos. El rol se vuelve a leer desde la base
en cada autenticación para que los cambios tengan efecto en el siguiente
request.

Las denegaciones 403 de los guards y de la regla de propiedad se escriben como
eventos JSON de auditoría con id y rol del actor, método, ruta, estado y hora.
El evento no registra encabezados, tokens ni cuerpos. En producción, envía los
logs de la aplicación a un almacenamiento centralizado con retención adecuada.

Para evaluar autorización, la estrategia carga desde la base la identidad
vigente y la deja en `request.user`. La información mínima para estas reglas es
`{ id, role }`: `id` se compara con `course.createdByUserId` y `role` distingue
`admin` de `teacher` y `student`. El cliente no puede asignar el propietario en
el DTO.

### Roles y protección de producción

En producción, donde `synchronize` está desactivado, aplica una sola vez a una
base existente
[`requests/migrations/20261117_roles_course_owner.sql`](./requests/migrations/20261117_roles_course_owner.sql).
En desarrollo, TypeORM sincroniza estas columnas automáticamente.
Después del registro, crea el primer administrador con acceso directo y seguro
a PostgreSQL, sustituyendo el correo por la cuenta designada:

```sql
UPDATE "user" SET role = 'admin'
WHERE email = lower(trim('admin@example.com'));
```

El primer administrador puede asignar `teacher`, `student` o `admin` desde
`PATCH /admin/users/:id/role`. No se permite quitar el rol al último admin. El
login limita a cinco intentos por dirección IP cada minuto; el contador es en
memoria por proceso y responde 429 al exceder el límite.

Para probar la autorización de cursos, crea una cuenta teacher y una student
con el endpoint de administración, inicia sesión con cada cuenta y conserva sus
tokens solo localmente. Crea un curso con cada docente: el servidor asigna
`createdByUserId` desde `request.user.id`; no envíes ese campo en el DTO. Luego
usa `PATCH /courses/:id` con un DTO válido y verifica esta matriz:

| Identidad | Actualizar curso propio | Actualizar curso ajeno | Borrar curso |
|---|---:|---:|---:|
| Sin token | 401 | 401 | 401 |
| `student` autenticado | 403 | 403 | 403 |
| `teacher` autenticado | 200 | 403 | 403 |
| `admin` autenticado | 200 | 200 | 200 |

En un `PATCH` autorizado, un DTO inválido sigue respondiendo 400. El permiso de
actualización combina `@Roles(admin, teacher)` con la regla de propiedad del
servicio; `DELETE` requiere `@Roles(admin)`.

En producción, sirve la API únicamente detrás de HTTPS/TLS con certificados
vigentes y configura el proxy para redirigir HTTP a HTTPS. Define `CORS_ORIGINS`
con los orígenes HTTPS exactos del frontend; no uses `*`.

Todas las respuestas de listado usan este contrato:

```json
{
  "items": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

## Ejemplos de consultas paginadas

1. `GET /courses?page=1&limit=5&sortBy=title&order=ASC` lista la primera
   página de cursos ordenada por título.
2. `GET /courses?level=beginner&page=1&limit=10` filtra por nivel y devuelve
   sus metadatos de paginación.
3. `GET /enrollments?search=ana&page=1&limit=10` busca sin distinguir
   mayúsculas entre el nombre del estudiante y el título del curso.
4. `GET /enrollments?search=ana&activeOnly=true&studentId=1&page=1&limit=5`
   combina búsqueda, estudiante, estado activo y paginación.

## Demostración

La colección [requests/enrollments.http](./requests/enrollments.http) contiene
los siete casos solicitados: creación de datos, matrícula válida, consulta
después de reiniciar la API, duplicado 409, estudiante inactivo 400, filtros
y cancelación seguida de consulta 404. Ajusta los ids de las variables si la
base de datos ya contiene registros.

Para probar específicamente paginación y búsquedas desde Postman, importa la
colección [requests/coursehub-pagination.postman_collection.json](./requests/coursehub-pagination.postman_collection.json)
y ejecuta sus solicitudes en orden. Está preparada para una base vacía: crea
12 cursos, guarda automáticamente el id del estudiante activo y verifica con
un test de Postman que las páginas 1 y 2 no repitan cursos.

## Comandos

```bash
npm run build
npm test
npm run test:e2e
```
