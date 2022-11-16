import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2eTypeOrmConfigService } from './db-config.e2e-service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [E2eTypeOrmConfigService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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

    it('should return viable jwt token on authenticated', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'myuser',
          password: '12345',
        })
        .expect(200);

      const jwt = loginResponse.body.access_token;
      expect(jwt).toBeDefined();

      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .auth(jwt, { type: 'bearer' })
        .expect(200);

      expect(profileResponse.body).toEqual({
        username: 'myuser',
      });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'myuser',
          password: '12345',
        })
        .expect(200);

      const refreshToken = loginResponse.body.refresh_token;
      expect(refreshToken).toBeDefined();

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);

      expect(refreshResponse.body.access_token).toBeDefined();
      expect(refreshResponse.body.refresh_token).toBeDefined();

      const newRefreshToken = refreshResponse.body.refresh_token;
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send({
          refresh_token: newRefreshToken,
        })
        .expect(200);
    });

    it('should fail if refresh uses access token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'myuser',
          password: '12345',
        })
        .expect(200);

      const accessToken = loginResponse.body.access_token;
      const refreshToken = loginResponse.body.refresh_token;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send({
          refresh_token: accessToken,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .auth(accessToken, { type: 'bearer' })
        .send({
          refresh_token: refreshToken,
        })
        .expect(401);
    });
  });
});
