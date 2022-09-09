import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ServiceDocsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/service-docs (POST)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer())
        .post('/service-docs')
        .send({
          name: 'test-service',
        })
        .expect(401);
    });

    it('should create service-doc', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-service',
        })
        .expect(201);
      expect(creationResponse.body.name).toBeDefined();
      expect(creationResponse.body.creationTimestamp).toBeDefined();
      expect(creationResponse.body.updateTimestamp).toBeDefined();
    });

    it('should overwrite existing service-doc', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-service',
          providedAPIs: ['myApi'],
        })
        .expect(201);

      const updateResponse = await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-service',
          consumedAPIs: ['yourAPI'],
        })
        .expect(201);
      expect(updateResponse.body.name).toEqual(creationResponse.body.name);
      expect(updateResponse.body.creationTimestamp).toEqual(
        creationResponse.body.creationTimestamp,
      );
      expect(updateResponse.body.updateTimestamp).not.toEqual(
        creationResponse.body.updateTimestamp,
      );
      expect(updateResponse.body.consumedAPIs).toContainEqual('yourAPI');
      expect(updateResponse.body.providedAPIs).toBeUndefined();
    });
  });

  describe('/service-docs (GET)', () => {
    beforeEach(async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .delete('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/service-docs').expect(401);
    });

    it('should list service-docs', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-service',
        })
        .expect(201);

      const listResponse = await request(app.getHttpServer())
        .get('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
      expect(listResponse.body.serviceDocs).toContainEqual({
        name: creationResponse.body.name,
        creationTimestamp: creationResponse.body.creationTimestamp,
        updateTimestamp: creationResponse.body.updateTimestamp,
      });
    });
  });

  describe('/service-docs/test-service (GET)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer())
        .get('/service-docs/test-service')
        .expect(401);
    });

    it('should fetch service-doc', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-service',
        })
        .expect(201);

      const testResponse = await request(app.getHttpServer())
        .get('/service-docs/test-service')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
      expect(testResponse.body).toEqual(creationResponse.body);
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
