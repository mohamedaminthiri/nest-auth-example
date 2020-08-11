import { build, fake } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';
import { setup } from '../src/setup';
import { TodoService } from '../src/todo/todo.service';

const createTodoBuilder = build({
  fields: {
    text: fake(f => f.lorem.sentence()),
  },
});

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let token: string;
  let service: TodoService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = setup(moduleFixture.createNestApplication());

    await app.init();

    request = supertest(app.getHttpServer());
    // service = app.get<TodoService>(TodoService);

    // const {
    //   header: { authorization },
    // } = await supertest(app.getHttpServer())
    //   .post('/auth/login')
    //   .send({ email: 'john@doe.me', password: 'Pa$$w0rd' });
    // [, token] = authorization.split(/\s+/);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should require authentication', async () => {
    await request
      .get('/todo')
      .send(createTodoBuilder())
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should create a new todo', async () => {
    const payload = createTodoBuilder();
    const resp = await request
      .put('/todo')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HttpStatus.CREATED);

    expect(resp.body).toHaveProperty('text', payload.text);
    expect(resp.body).toHaveProperty('done', false);
  });

  /* it('should fail to create with invalid body', async () => {
    const resp = await request
      .put('/todo')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect('Content-Type', /json/);

    expect(resp.body).toHaveProperty('error', 'Unprocessable Entity');
  });

  it('should list all todos that belong to user', async () => {
    const resp = await request
      .get('/todo')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /json/);

    expect(Array.isArray(resp.body)).toBe(true);
  });

  it('should get one todo that belong to user', async () => {
    const todos = service.listTodo(1 as any);
    const resp = await request
      .get(`/todo/${todos[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /json/);

    expect(resp.body).toBeDefined();
    expect(resp.body).not.toHaveProperty('owner');
  }); */
});
