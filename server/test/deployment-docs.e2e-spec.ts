import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateDeploymentDocRequest } from '../src/deployment-docs/deployment-doc.dto';

describe('DeploymentDocsController (e2e)', () => {
  let app: INestApplication;

  const exampleDeploymentDoc: CreateDeploymentDocRequest = {
    name: 'test-deployment',
    kubernetesUrl: 'test-url',
    kubernetesUser: 'test-user',
    kubernetesPassword: 'test-pw',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/deployment-docs (POST)', () => {
    beforeEach(async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .delete('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should be protected', async () => {
      await request(app.getHttpServer())
        .post('/deployment-docs')
        .send(exampleDeploymentDoc)
        .expect(401);
    });

    it('should be allow jwt access token', async () => {
      await request(app.getHttpServer())
        .post('/deployment-docs')
        .send(exampleDeploymentDoc)
        .expect(401);
    });

    it('should be allow api-key', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(exampleDeploymentDoc)
        .expect(201);
    });

    it('should be allow api-key', async () => {
      const accessToken = await getAccessToken();
      const apiKey = await getApiKey(accessToken);
      await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(apiKey, { type: 'bearer' })
        .send(exampleDeploymentDoc)
        .expect(201);
    });

    it('should create simple deployment-doc', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(exampleDeploymentDoc)
        .expect(201);
      expect(creationResponse.body.name).toBeDefined();
      expect(creationResponse.body.creationTimestamp).toBeDefined();
      expect(creationResponse.body.updateTimestamp).toBeDefined();
    });

    it('should create complex deployment-doc', async () => {
      const accessToken = await getAccessToken();
      const dto: CreateDeploymentDocRequest = {
        name: 'test-deployment',
        kubernetesUrl: 'test-url',
        kubernetesUser: 'test-user',
        kubernetesPassword: 'test-pw',
        kubernetesLabels: ['test', 'label'],
      };

      const creationResponse = await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(201);

      expect(creationResponse.body.name).toEqual(dto.name);
      expect(creationResponse.body.kubernetesUrl).toEqual(dto.kubernetesUrl);
      expect(creationResponse.body.kubernetesUser).toEqual(dto.kubernetesUser);
      expect(creationResponse.body.kubernetesPassword).toEqual(
        dto.kubernetesPassword,
      );
      expect(creationResponse.body.kubernetesLabels).toEqual(
        dto.kubernetesLabels,
      );
      expect(creationResponse.body.creationTimestamp).toBeDefined();
      expect(creationResponse.body.updateTimestamp).toBeDefined();
    });

    it('should overwrite existing deployment-doc', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(exampleDeploymentDoc)
        .expect(201);

      const updateResponse = await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send({
          name: 'test-deployment',
          kubernetesUrl: 'test-url2',
          kubernetesUser: 'test-user2',
          kubernetesPassword: 'test-pw2',
          kubernetesLabels: ['test', 'label'],
        })
        .expect(201);
      expect(updateResponse.body.name).toEqual(creationResponse.body.name);
      expect(updateResponse.body.creationTimestamp).toEqual(
        creationResponse.body.creationTimestamp,
      );
      expect(updateResponse.body.updateTimestamp).not.toEqual(
        creationResponse.body.updateTimestamp,
      );
      expect(updateResponse.body.kubernetesUrl).not.toEqual(
        creationResponse.body.kubernetesUrl,
      );
      expect(updateResponse.body.kubernetesUser).not.toEqual(
        creationResponse.body.kubernetesUser,
      );
      expect(updateResponse.body.kubernetesPassword).not.toEqual(
        creationResponse.body.kubernetesPassword,
      );
      expect(updateResponse.body.kubernetesLabels).not.toEqual(
        creationResponse.body.kubernetesLabels,
      );
    });
  });

  describe('/deployment-docs (GET)', () => {
    beforeEach(async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .delete('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/deployment-docs').expect(401);
    });

    it('should list deployment-docs', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(exampleDeploymentDoc)
        .expect(201);

      const listResponse = await request(app.getHttpServer())
        .get('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
      expect(listResponse.body.deploymentDocs).toContainEqual({
        name: creationResponse.body.name,
        kubernetesUrl: creationResponse.body.kubernetesUrl,
        kubernetesUser: creationResponse.body.kubernetesUser,
        kubernetesPassword: creationResponse.body.kubernetesPassword,
        creationTimestamp: creationResponse.body.creationTimestamp,
        updateTimestamp: creationResponse.body.updateTimestamp,
      });
    });
  });

  describe('/deployment-docs/test-service (GET)', () => {
    it('should be protected', async () => {
      await request(app.getHttpServer())
        .get('/deployment-docs/test-service')
        .expect(401);
    });

    it('should fetch deployment-doc', async () => {
      const accessToken = await getAccessToken();
      const creationResponse = await request(app.getHttpServer())
        .post('/deployment-docs')
        .auth(accessToken, { type: 'bearer' })
        .send(exampleDeploymentDoc)
        .expect(201);

      const testResponse = await request(app.getHttpServer())
        .get('/deployment-docs/test-deployment')
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
