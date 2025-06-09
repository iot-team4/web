import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PrismaModule } from '@src/prisma/prisma.module';
import { AppRepository } from '@src/app.repository';
import { PiGateway } from '@src/gateway/pi.gateway';
import { FrontendGateway } from '@src/gateway/frontend.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'build'),
      exclude: ['/api*'],
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository, PiGateway, FrontendGateway],
})
export class AppModule {}
