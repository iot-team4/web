import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'build'),
      exclude: ['/api*'],
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
