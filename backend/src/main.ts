import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that aren't in the DTO
      forbidNonWhitelisted: true, // Throw error if extra properties are present
      transform: true, // Automatically transform payloads to DTO classes
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth() // Add this for JWT token support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // localhost:3000/api
  app.enableCors({
    origin: 'http://localhost:4200',
    // credentials: true, // if you use cookies or auth headers
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
