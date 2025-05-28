import { Injectable } from '@nestjs/common';
import { SensorType } from '@prisma/client';
import { AppRepository } from '@src/app.repository';
import { createSensorDataRequestBodyDto } from '@src/dtos/create-sensor-data-request-body.dto';

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  getHello(): string {
    return 'Hello World!';
  }

  createSensorData(createSensorDataRequestBody: createSensorDataRequestBodyDto) {
    return this.appRepository.createSensorData(createSensorDataRequestBody);
  }

  async getAllLastSensorData() {
    const sensorTypes = Object.values(SensorType);

    return Promise.all(
      sensorTypes.map((sensorType) => this.appRepository.getLastSensorData(sensorType)),
    );
  }
}
