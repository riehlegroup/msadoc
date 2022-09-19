import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('msdoc server API')
    .setDescription('The msdoc server API description')
    .setVersion('1.0')
    .addTag('server')
    .addSecurity('jwt', {
      type: 'http',
      scheme: 'bearer',
      description: 'JWT access_token',
    })
    .addSecurity('jwt-refresh', {
      type: 'http',
      scheme: 'bearer',
      description: 'JWT refresh_token',
    })
    .addSecurity('api-key', {
      type: 'http',
      scheme: 'bearer',
      description: 'API key',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.getOrThrow('msadoc_frontend_url'),
  });

  await app.listen(3000);
}
bootstrap();
