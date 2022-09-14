import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateServiceDocRequest } from '../src/service-docs/service-doc.dto';

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
    beforeEach(async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .delete('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should be protected', async () => {
      await request(app.getHttpServer())
        .post('/service-docs')
        .send({
          name: 'test-service',
        })
        .expect(401);
    });

    it('should allow access by jwt access_token', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-service',
        })
        .expect(201);
    });

    it('should allow access by api-key', async () => {
      const accessToken = await getAccessToken();
      const apiKey = await getApiKey(accessToken);
      await request(app.getHttpServer())
        .post('/service-docs')
        .auth(apiKey, { type: 'bearer' })
        .send({
          name: 'test-service',
        })
        .expect(201);
    });

    it('should create simple service-doc', async () => {
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

    it('should create complex service-doc', async () => {
      const accessToken = await getAccessToken();
      const dto: CreateServiceDocRequest = {
        name: 'test-service',
        group: 'test.group',
        tags: ['t', 'es'],
        repository: 'repo',
        taskBoard: 'tasks',
        providedAPIs: ['API1', 'API2'],
        producedEvents: ['event1', 'event2'],
        consumedAPIs: ['API3', 'API4'],
        consumedEvents: ['event3', 'event4'],
        apiDocumentation: 'api',
        deploymentDocumentation: 'deploy',
        developmentDocumentation: 'develop',
        responsibles: ['r1', 'r2'],
        responsibleTeam: 'team',
      };

      const creationResponse = await request(app.getHttpServer())
        .post('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(201);

      expect(creationResponse.body.name).toEqual(dto.name);
      expect(creationResponse.body.tags).toEqual(dto.tags);
      expect(creationResponse.body.repository).toEqual(dto.repository);
      expect(creationResponse.body.taskBoard).toEqual(dto.taskBoard);
      expect(creationResponse.body.providedAPIs).toEqual(dto.providedAPIs);
      expect(creationResponse.body.producedEvents).toEqual(dto.producedEvents);
      expect(creationResponse.body.consumedAPIs).toEqual(dto.consumedAPIs);
      expect(creationResponse.body.consumedEvents).toEqual(dto.consumedEvents);
      expect(creationResponse.body.apiDocumentation).toEqual(
        dto.apiDocumentation,
      );
      expect(creationResponse.body.deploymentDocumentation).toEqual(
        dto.deploymentDocumentation,
      );
      expect(creationResponse.body.developmentDocumentation).toEqual(
        dto.developmentDocumentation,
      );
      expect(creationResponse.body.responsibles).toEqual(dto.responsibles);
      expect(creationResponse.body.responsibleTeam).toEqual(
        dto.responsibleTeam,
      );
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

    it('should allow access by jwt access_token', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .get('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should allow access by api-key', async () => {
      const accessToken = await getAccessToken();
      const apiKey = await getApiKey(accessToken);
      await request(app.getHttpServer())
        .get('/service-docs')
        .auth(apiKey, { type: 'bearer' })
        .expect(200);
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

    it('should allow access by jwt access_token', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .get('/service-docs/test-service')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should allow access by api-key', async () => {
      const accessToken = await getAccessToken();
      const apiKey = await getApiKey(accessToken);
      await request(app.getHttpServer())
        .get('/service-docs/test-service')
        .auth(apiKey, { type: 'bearer' })
        .expect(200);
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

  async function getApiKey(accessToken: string): Promise<string> {
    const apiKeyResponse = await request(app.getHttpServer())
      .post('/api-keys')
      .auth(accessToken, { type: 'bearer' })
      .send({
        keyName: 'testkey',
      });
    return apiKeyResponse.body.apiKey;
  }
});
