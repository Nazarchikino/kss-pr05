// Наскрізні (e2e) тести практичної роботи № 5. Файл не змінюйте.
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('helpdesk-api (e2e) – ПР5', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    http = request(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  describe('health', () => {
    it('GET /api/v1/health → 200, стан, назва і версія з package.json', async () => {
      const res = await http.get('/api/v1/health').expect(200);
      expect(res.body).toMatchObject({ status: 'ok', name: 'helpdesk-api' });
      expect(res.body.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(typeof res.body.uptime).toBe('number');
    });

    it('маршрути доступні лише з префіксом /api/v1', async () => {
      await http.get('/health').expect(404);
    });
  });

  describe('users', () => {
    it('GET /api/v1/users → 3 користувачі', async () => {
      const res = await http.get('/api/v1/users').expect(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toMatchObject({ id: 1, role: 'student' });
    });

    it('GET /api/v1/users/3 → адміністратор', async () => {
      const res = await http.get('/api/v1/users/3').expect(200);
      expect(res.body).toMatchObject({ id: 3, role: 'admin' });
    });

    it('GET /api/v1/users/99 → 404', async () => {
      await http.get('/api/v1/users/99').expect(404);
    });

    it('GET /api/v1/users/abc → 400 (ParseIntPipe)', async () => {
      await http.get('/api/v1/users/abc').expect(400);
    });
  });

  describe('tickets', () => {
    it('GET /api/v1/tickets → 6 заявок з початкових даних', async () => {
      const res = await http.get('/api/v1/tickets').expect(200);
      expect(res.body).toHaveLength(6);
    });

    it('GET /api/v1/tickets?status=open → лише відкриті', async () => {
      const res = await http.get('/api/v1/tickets?status=open').expect(200);
      expect(res.body.length).toBe(3);
      expect(res.body.every((t: { status: string }) => t.status === 'open')).toBe(true);
    });

    it('GET /api/v1/tickets?authorId=1 → заявки автора', async () => {
      const res = await http.get('/api/v1/tickets?authorId=1').expect(200);
      expect(res.body.map((t: { id: number }) => t.id)).toEqual([2, 4, 5]);
    });

    it('GET /api/v1/tickets/1 → 200; /999 → 404; /abc → 400', async () => {
      const res = await http.get('/api/v1/tickets/1').expect(200);
      expect(res.body).toMatchObject({ id: 1, status: 'open', assigneeId: 3 });
      await http.get('/api/v1/tickets/999').expect(404);
      await http.get('/api/v1/tickets/abc').expect(400);
    });

    it('POST /api/v1/tickets → 201, стан open, id = 7, дати заповнено', async () => {
      const res = await http
        .post('/api/v1/tickets')
        .send({ title: 'Не працює миша', priority: 'low', authorId: 1 })
        .expect(201);
      expect(res.body).toMatchObject({ id: 7, title: 'Не працює миша', status: 'open', assigneeId: null, tags: [] });
      expect(Date.parse(res.body.createdAt)).not.toBeNaN();
      expect(res.body.updatedAt).toBe(res.body.createdAt);
    });

    it('POST /api/v1/tickets з неіснуючим автором → 422', async () => {
      await http.post('/api/v1/tickets').send({ title: 'Миша', priority: 'low', authorId: 42 }).expect(422);
    });

    it('DELETE /api/v1/tickets/4 → 204, повторно → 404', async () => {
      await http.delete('/api/v1/tickets/4').expect(204);
      await http.get('/api/v1/tickets/4').expect(404);
      await http.delete('/api/v1/tickets/4').expect(404);
    });

    it('кожен тест отримує свіжий застосунок: заявка 4 знову існує', async () => {
      await http.get('/api/v1/tickets/4').expect(200);
    });
  });
});
