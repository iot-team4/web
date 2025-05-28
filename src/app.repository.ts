import { Injectable } from '@nestjs/common';
import { SensorData, SensorType } from '@prisma/client';
import { createSensorDataRequestBodyDto } from '@src/dtos/create-sensor-data-request-body.dto';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class AppRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSensorData(
    createSensorDataRequestBody: createSensorDataRequestBodyDto,
  ): Promise<SensorData> {
    return await this.prismaService.sensorData.create({
      data: {
        sensorType: createSensorDataRequestBody.sensorType,
        value: createSensorDataRequestBody.value,
      },
    });
  }

  async getLastSensorData(sensorType: SensorType): Promise<SensorData | null> {
    return await this.prismaService.sensorData.findFirst({
      where: {
        sensorType,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
