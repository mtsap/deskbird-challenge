import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggingMiddleware } from './logging/middleware';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.validation';
import * as dotenv from 'dotenv';

dotenv.config();
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.issues);
  process.exit(1);
}

const env = parsed.data;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => env],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
