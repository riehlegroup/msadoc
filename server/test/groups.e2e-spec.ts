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

  describe('/service-groups (GET)', () => {
    beforeEach(async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .delete('/service-docs')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should be protected', async () => {
      await request(app.getHttpServer()).get('/service-groups').expect(401);
    });

    it('should be allow jwt access token', async () => {
      await request(app.getHttpServer()).get('/service-groups').expect(401);
    });

    it('should be allow api-key', async () => {
      const accessToken = await getAccessToken();
      await request(app.getHttpServer())
        .get('/service-groups')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should generate groups from service-doc', async () => {
      const accessToken = await getAccessToken();
      await createServiceDoc('MyTest', 'my.tests');
      await createServiceDoc('MyTest2', 'my.tests');
      await createServiceDoc('MySubTest', 'my.tests.subtests');
      await createServiceDoc('YourTest', 'your.tests');
      await createServiceDoc('LostTest');

      const groupsResponse = await request(app.getHttpServer())
        .get('/service-groups')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);

      expect(groupsResponse.body).toBeDefined();
      expect(groupsResponse.body).toEqual({
        name: 'root',
        services: ['LostTest'],
        groups: [
          {
            name: 'my',
            services: [],
            groups: [
              {
                name: 'tests',
                services: ['MyTest', 'MyTest2'],
                groups: [
                  {
                    name: 'subtests',
                    services: ['MySubTest'],
                    groups: [],
                  },
                ],
              },
            ],
          },
          {
            name: 'your',
            services: [],
            groups: [
              {
                name: 'tests',
                services: ['YourTest'],
                groups: [],
              },
            ],
          },
        ],
      });
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

  async function createServiceDoc(
    serviceName: string,
    groupName?: string,
  ): Promise<void> {
    const accessToken = await getAccessToken();
    await request(app.getHttpServer())
      .post('/service-docs')
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: serviceName,
        group: groupName,
      });
  }
});
