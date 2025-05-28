import { Injectable } from '@nestjs/common';
import { SensorData, SensorType } from '@prisma/client';
import { SensorDataDto } from '@src/dtos/sensor-data.dto';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class AppRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSensorData(sensorData: SensorDataDto): Promise<SensorData> {
    return await this.prismaService.sensorData.create({
      data: {
        sensorType: sensorData.sensorType,
        value: sensorData.value,
        createdAt: sensorData.createdAt,
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
