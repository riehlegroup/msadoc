import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ApiKeysController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api-keys (POST)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer())
        .post('/api-keys')
        .send({
          keyName: 'testkey',
        })
        .expect(401);
    });

    it('should create api keys', async () => {
      const accessToken = await getAccessToken();
      const apiKeyResponse = await request(app.getHttpServer())
        .post('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          keyName: 'testkey',
        })
        .expect(200);
      expect(apiKeyResponse.body.apiKey).toBeDefined();
    });
  });

  describe('/api-keys (GET)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/api-keys').expect(401);
    });

    it('should list api keys', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .post('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          keyName: 'testkey',
        })
        .expect(200);

      const apiKeyResponse = await request(app.getHttpServer())
        .get('/api-keys')
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
