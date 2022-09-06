import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

      const profileResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);

      expect(profileResponse.body.access_token).toBeDefined();
      expect(profileResponse.body.refresh_token).toBeDefined();
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

  describe('/auth/api-keys (POST)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer())
        .post('/auth/api-keys')
        .send({
          keyName: 'testkey',
        })
        .expect(401);
    });

    it('should create api keys', async () => {
      const accessToken = await getAccessToken();
      const apiKeyResponse = await request(app.getHttpServer())
        .post('/auth/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          keyName: 'testkey',
        })
        .expect(200);
      expect(apiKeyResponse.body.apiKey).toBeDefined();
    });
  });

  describe('/auth/api-keys (GET)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/auth/api-keys').expect(401);
    });

    it('should list api keys', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .post('/auth/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          keyName: 'testkey',
        })
        .expect(200);

      const apiKeyResponse = await request(app.getHttpServer())
        .get('/auth/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
      expect(apiKeyResponse.body.apiKeys).toEqual([
        {
          keyName: 'testkey',
        },
      ]);
    });
  });

  async function getAccessToken(): Promise<string> {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'myuser',
        password: '12345',
      });
    return loginResponse.body.access_token;
  }
});
