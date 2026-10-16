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
3. Si usas Docker Compose, configura también `POSTGRES_DB`,
   `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT`.
4. Instala dependencias y ejecuta la API:

```bash
npm install
npm run start:dev
```

`synchronize` está habilitado únicamente cuando `NODE_ENV` no es `production`,
para desarrollo local. No se usan migraciones de producción en este proyecto.

## Validación y errores

La aplicación usa `ValidationPipe` global con transformación, whitelist y
rechazo de propiedades desconocidas. Los errores de validación responden 400.
Las búsquedas de recursos inexistentes responden 404 y los duplicados
responden 409 con `ConflictException`. El correo de estudiante y la pareja
estudiante-curso también tienen restricciones únicas en PostgreSQL para cubrir
condiciones de carrera.

## Endpoints

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| `POST` | `/students` | Crea un estudiante | 201, 400, 409 |
| `GET` | `/students` | Lista estudiantes; admite filtros | 200 |
| `GET` | `/students/:id` | Obtiene un estudiante | 200, 404 |
| `PATCH` | `/students/:id` | Actualiza un estudiante | 200, 400, 404, 409 |
| `PATCH` | `/students/:id/status` | Cambia `isActive` | 200, 400, 404 |
| `POST` | `/courses` | Crea un curso persistido | 201, 400 |
| `GET` | `/courses` | Lista cursos paginados; query `level`, `page`, `limit`, `sortBy` (`id`, `title`, `level`) y `order` (`ASC`, `DESC`) | 200, 400 |
| `GET` | `/courses/:id` | Obtiene un curso | 200, 400, 404 |
| `POST` | `/enrollments` | Crea matrícula validando estudiante, curso, estado y duplicado | 201, 400, 404, 409 |
| `GET` | `/enrollments` | Lista matrículas paginadas; combina `search`, `studentId`, `courseId`, `activeOnly`, `page` y `limit` | 200, 400 |
| `GET` | `/enrollments/:id` | Obtiene una matrícula con estudiante y curso | 200, 400, 404 |
| `GET` | `/students/:studentId/enrollments` | Lista matrículas del estudiante | 200, 400, 404 |
| `GET` | `/courses/:courseId/enrollments` | Lista matrículas del curso | 200, 400, 404 |
| `DELETE` | `/enrollments/:id` | Cancela/elimina una matrícula | 200, 400, 404 |

Las respuestas de matrículas incluyen información no sensible del estudiante
(`id`, `name`, `email`, `age`, `career`, `semester`, `isActive`) y del curso
(`id`, `title`, `level`); no se exponen credenciales.

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
