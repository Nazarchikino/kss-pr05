# Вимоги практичної роботи № 5 «Модулі, контролери, провайдери, впровадження залежностей»

Усі маршрути – з префіксом `/api/v1` (налаштовано у `src/app.setup.ts`). Дані зберігаються в пам’яті.
Перевірка: `npm run check` (14 e2e-тестів у `test/app.e2e-spec.ts` і 4 модульні тести в `src/tickets/tickets.service.spec.ts`).
Файли тестів, моделей (`*.model.ts`), початкових даних (`*.seed.ts`), `src/common/clock.ts`, `src/tickets/tickets.repository.ts` і `src/app.setup.ts` не змінюйте.

## Структура модулів

| Модуль | Контролер | Провайдери | Імпортує / експортує |
|---|---|---|---|
| AppModule | HealthController | `APP_INFO` (useFactory) | імпортує UsersModule, TicketsModule |
| UsersModule | UsersController | UsersService | експортує UsersService |
| TicketsModule | TicketsController | TicketsService; `TicketsRepository` → InMemoryTicketsRepository (useClass); `CLOCK` → systemClock (useValue) | імпортує UsersModule |

## Маршрути

| Метод і шлях | Відповідь |
|---|---|
| GET /health | 200 `{ status: "ok", name, version, uptime }`; name і version – з package.json |
| GET /users | 200, масив користувачів (3 з `USERS_SEED`) |
| GET /users/{userId} | 200; 404 – немає; 400 – не число |
| GET /tickets?status=&authorId= | 200, масив заявок (фільтри необов’язкові) |
| GET /tickets/{ticketId} | 200; 404; 400 |
| POST /tickets `{ title, priority, authorId, description?, tags? }` | 201, нова заявка: стан open, assigneeId null, createdAt = updatedAt = час з `CLOCK`; 422 – автора не існує |
| DELETE /tickets/{ticketId} | 204; 404 |

## Сервіси

- `UsersService`: `findAll()`, `find(id)` → User або undefined, `findOne(id)` → User або NotFoundException.
- `InMemoryTicketsRepository extends TicketsRepository`: завантажує `TICKETS_SEED` у хуку `onModuleInit` і пише в журнал кількість заявок; повертає копії об’єктів.
- `TicketsService(repo: TicketsRepository, users: UsersService, @Inject(CLOCK) clock)`: `findAll`, `findOne` (404), `create` (422 для неіснуючого автора; сховище не викликається), `remove` (404).
