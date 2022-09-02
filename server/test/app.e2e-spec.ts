import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/auth/login (GET)', () => {
    it('should return 401 because unauthenticated', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'unauthorized',
          password: 'none',
        })
        .expect(401);
    });

    it('should return user on authenticated', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'myuser',
          password: '12345',
        })
        .expect(200)
        .expect({
          name: 'admin',
        });
    });
  });
});
