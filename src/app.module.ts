import { Module } from '@nestjs/common';
import { APP_INFO, appInfoFactory } from './app-info.js';
import { HealthController } from './health.controller.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [HealthController],
  providers: [{ provide: APP_INFO, useFactory: appInfoFactory }],
})
export class AppModule {}
