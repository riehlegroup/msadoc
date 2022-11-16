import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2eTypeOrmConfigService } from './db-config.e2e-service';

describe('ApiKeysController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [E2eTypeOrmConfigService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // enable model validation
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
        .expect(201);
      expect(apiKeyResponse.body.id).toBeDefined();
      expect(apiKeyResponse.body.apiKey).toBeDefined();
      expect(apiKeyResponse.body.creationTimestamp).toBeDefined();
    });

    it('should validate model', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .post('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          // missing required property "keyName"
        })
        .expect(400);
    });
  });

  describe('/api-keys (GET)', () => {
    beforeEach(async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .delete('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/api-keys').expect(401);
    });

    it('should list api keys', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          keyName: 'testkey',
        })
        .expect(201);

      const listResponse = await request(app.getHttpServer())
        .get('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
      expect(listResponse.body.apiKeys).toContainEqual({
        id: creationResponse.body.id,
        keyName: creationResponse.body.keyName,
        creationTimestamp: creationResponse.body.creationTimestamp,
      });
    });
  });

  describe('/api-keys/test (GET)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/api-keys/test').expect(401);
    });

    it('should validate valid api key', async () => {
      const accessToken = await getAccessToken();
      const apiKeyResponse = await request(app.getHttpServer())
        .post('/api-keys')
        .auth(accessToken, { type: 'bearer' })
        .send({
          keyName: 'testkey',
        })
        .expect(201);
      const apiKey = apiKeyResponse.body.apiKey;

      const testResponse = await request(app.getHttpServer())
        .get('/api-keys/test')
        .auth(apiKey, { type: 'bearer' })
        .expect(200);
      expect(testResponse.body).toEqual({
        isApiKeyValid: true,
      });
    });
  });

  it('should not validate invalid api key', async () => {
    const testResponse = await request(app.getHttpServer())
      .get('/api-keys/test')
      .auth('invalidApiKey', { type: 'bearer' })
      .expect(401);
    expect(testResponse.body).toEqual({
      isApiKeyValid: false,
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
